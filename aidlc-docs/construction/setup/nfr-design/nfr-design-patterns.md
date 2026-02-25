# NFR Design Patterns — Unit 1: setup

---

## Pattern 1: Retry Pattern — Database Connection

**NFR driver**: NFR-04 (Reliability), BR-03

**Problem**: The PostgreSQL container may not be ready when the backend container starts, especially on `docker-compose up` from a cold start.

**Solution**: Implement a retry loop in the startup sequence that attempts `PrismaClient.$connect()` up to 10 times with a 2-second fixed wait between attempts. The HTTP server does not start until connection succeeds.

**Design**:
```
connectWithRetry(maxAttempts=10, delayMs=2000):
  for attempt in 1..maxAttempts:
    try:
      await prisma.$connect()
      log.info("Database connected on attempt {attempt}")
      return
    catch error:
      log.warn("DB connection attempt {attempt}/{maxAttempts} failed: {error.message}")
      if attempt < maxAttempts:
        await sleep(delayMs)
  log.error("Could not connect to database after {maxAttempts} attempts")
  process.exit(1)
```

**Key constraint**: No exponential backoff — fixed 2s interval keeps total max wait predictable (20s worst case), which fits well within Docker health check timeouts.

---

## Pattern 2: Fail-Fast Pattern — Environment Validation

**NFR driver**: NFR-02 (Security), BR-04

**Problem**: A server that starts with missing configuration (e.g., no `JWT_SECRET`) will fail at runtime in unpredictable ways — potentially serving unauthenticated requests or leaking error details.

**Solution**: Validate all required environment variables at the very start of the process, before any initialization. Exit immediately on the first missing variable with a clear diagnostic message.

**Design**:
```
validateEnv(required: string[]):
  for varName in required:
    if not process.env[varName] or process.env[varName] is empty:
      log.fatal("Missing required environment variable: {varName}")
      process.exit(1)
```

**Execution order**: `validateEnv()` is the first function called in `index.ts`, before `connectWithRetry()`, `ContentService.initialize()`, or Express app creation.

---

## Pattern 3: Singleton Pattern — Shared Clients

**NFR driver**: Performance (connection pool), Maintainability

**Problem**: Creating a new `PrismaClient` in each repository would open separate connection pools, exhausting the DB connection limit quickly.

**Solution**: Create one `PrismaClient` and one `pino` logger instance at module load time. Export them as module-level singletons. All repositories and middleware import from the same singleton file.

**Design**:
```
lib/prisma.ts  → export const prisma = new PrismaClient(...)
lib/logger.ts  → export const log = pino({ level: LOG_LEVEL })
```

Node.js module caching ensures these are instantiated exactly once per process, regardless of how many files import them.

---

## Pattern 4: Structured Logging Pattern — pino

**NFR driver**: Maintainability (log searchability, pino chosen in NFR Requirements)

**Problem**: Plain `console.log` produces unstructured text that cannot be queried, filtered, or forwarded to log aggregators.

**Solution**: All log statements emit JSON objects via `pino`. In development, pipe through `pino-pretty` for human-readable output. In production, raw JSON to stdout is captured by Docker and can be forwarded to any aggregator.

**Design**:
```
log.info({ userId, unit, exercise }, "Session started")
→ { "level": 30, "time": 1708819200000, "msg": "Session started", "userId": 1, "unit": "docker", "exercise": "01-..." }

log.error({ err, requestId }, "Unhandled error in route handler")
→ { "level": 50, "time": ..., "msg": "Unhandled error...", "err": { "message": "...", "stack": "..." } }
```

**Log level ladder**:
| Level | Used For |
|-------|---------|
| `error` | 5xx errors, startup failures, DB connection failure |
| `warn` | 4xx errors, DB retry attempts |
| `info` | Server started, DB connected, content index built |
| `debug` | Request details, cache hits/misses (development only) |

---

## Pattern 5: Health Check Pattern — Readiness Probe

**NFR driver**: NFR-05 (Deployment), NFR-04 (Reliability), BR-01

**Problem**: Docker Compose and external monitors need to know whether the application is ready to serve traffic — not just that the process is running.

**Solution**: `GET /health` executes a `SELECT 1` query against PostgreSQL on every call. Returns 200 with `{ status: "ok", db: "connected" }` on success, 503 with `{ status: "degraded", db: "unreachable" }` on failure.

**Design**:
```
HealthController.check():
  try:
    await prisma.$queryRaw`SELECT 1`
    return 200 { status: "ok", db: "connected" }
  catch error:
    log.warn("Health check DB query failed")
    return 503 { status: "degraded", db: "unreachable" }
```

**Not protected by AuthMiddleware** — health checks must be callable without credentials.

---

## Pattern 6: Error Envelope Pattern

**NFR driver**: Maintainability (consistent API contract), BR-02

**Problem**: Without a standard error shape, API clients must handle many different error formats. This leads to duplicated error-parsing logic on the frontend.

**Solution**: All errors — regardless of origin — are caught by `ErrorMiddleware` and serialized to the same JSON envelope before being sent to the client:

```json
{ "error": { "code": "STRING_CODE", "message": "Human-readable string" } }
```

**Design**: Application code throws typed error objects (e.g., `NotFoundError`, `UnauthorizedError`). `ErrorMiddleware` maps error type → HTTP status + code string → envelope JSON.

```
class AppError extends Error {
  constructor(public code: string, public statusCode: number, message: string)
}
class NotFoundError extends AppError   { code="NOT_FOUND",     statusCode=404 }
class UnauthorizedError extends AppError { code="UNAUTHORIZED", statusCode=401 }
class BadRequestError extends AppError   { code="BAD_REQUEST",  statusCode=400 }
class InternalError extends AppError     { code="INTERNAL_ERROR", statusCode=500 }
```

Unknown errors (not an `AppError` subclass) are wrapped as `InternalError` with the original message redacted in production.

---

## Pattern 7: Graceful Shutdown Pattern

**NFR driver**: NFR-04 (Reliability)

**Problem**: `docker-compose down` sends `SIGTERM` to the container. If the process exits immediately, in-flight requests are dropped and the DB connection pool may not close cleanly.

**Solution**: Register `SIGTERM` and `SIGINT` handlers that:
1. Call `server.close()` — stops accepting new connections
2. Wait up to 5 seconds for in-flight requests to complete
3. Call `prisma.$disconnect()` — closes the connection pool
4. `process.exit(0)`

```
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

async gracefulShutdown():
  log.info("Shutdown signal received — draining connections")
  server.close(async () => {
    await prisma.$disconnect()
    log.info("Shutdown complete")
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 5000)  // force exit after 5s
```

---

## Pattern 8: Middleware Chain Pattern

**NFR driver**: Maintainability, Security (correct middleware ordering)

**Problem**: Express middleware order is significant. `ErrorMiddleware` must be last. Auth middleware must run before route handlers. Body parsers must run before anything that reads `req.body`.

**Solution**: Document and enforce a fixed middleware registration sequence. The order is specified in `business-logic-model.md` and must be implemented exactly as described — no deviations.

**Guardrail**: `ErrorMiddleware` is registered as the final `app.use()` call, identified by its 4-argument signature `(err, req, res, next)`. A code comment marks it as "MUST BE LAST".
