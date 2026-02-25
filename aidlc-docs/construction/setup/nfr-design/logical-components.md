# Logical Components — Unit 1: setup

These are the logical components introduced by Unit 1 to satisfy NFR requirements. They are shared infrastructure used by all subsequent units.

---

## Component: Logger (`lib/logger.ts`)

**Pattern**: Structured Logging (Pattern 4), Singleton (Pattern 3)

**Responsibility**: Provides a single `pino` logger instance for the entire application.

**Interface**:
```typescript
export const log: pino.Logger
// Usage:
log.info(msg)
log.info({ context }, msg)
log.warn({ err }, msg)
log.error({ err, stack }, msg)
```

**Configuration**:
- Level from `LOG_LEVEL` env var (default: `"info"`)
- In development (`NODE_ENV=development`): use `pino-pretty` transport for readable output
- In production: raw JSON to stdout

**Consumers**: All controllers, services, middleware, and startup functions import `log` from this module.

---

## Component: PrismaClient Singleton (`lib/prisma.ts`)

**Pattern**: Singleton (Pattern 3)

**Responsibility**: Creates and exports one `PrismaClient` instance with the configured connection pool.

**Interface**:
```typescript
export const prisma: PrismaClient
```

**Configuration**:
- Connection pool: `connection_limit=5` (set via `DATABASE_URL` query parameter)
- Query logging: enabled in development (`log: ['query', 'error']`), errors only in production

**Consumers**: All repository files, startup functions, and `HealthController`.

---

## Component: Environment Validator (`lib/env.ts`)

**Pattern**: Fail-Fast (Pattern 2)

**Responsibility**: Validates that all required environment variables are present at startup. Exits the process immediately if any are missing.

**Interface**:
```typescript
export function validateEnv(): void
// Checks: DATABASE_URL, JWT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
//         FRONTEND_URL, CONTENT_PATH, PORT
// Throws: process.exit(1) on first missing variable
```

**Called by**: `index.ts` as the first action on startup, before any other initialization.

---

## Component: Database Connector (`lib/db.ts`)

**Pattern**: Retry (Pattern 1)

**Responsibility**: Wraps `prisma.$connect()` with retry logic. Resolves when the connection succeeds, exits the process after 10 failed attempts.

**Interface**:
```typescript
export async function connectWithRetry(
  maxAttempts?: number,   // default: 10
  delayMs?: number        // default: 2000
): Promise<void>
```

**Called by**: `index.ts` after `validateEnv()`, before Express app creation.

---

## Component: App Error Classes (`lib/errors.ts`)

**Pattern**: Error Envelope (Pattern 6)

**Responsibility**: Defines typed error classes that carry HTTP status codes and machine-readable codes. Controllers and services throw these; `ErrorMiddleware` catches and serializes them.

**Interface**:
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string
  )
}

export class NotFoundError extends AppError     // 404, "NOT_FOUND"
export class UnauthorizedError extends AppError // 401, "UNAUTHORIZED"
export class ForbiddenError extends AppError    // 403, "FORBIDDEN"
export class BadRequestError extends AppError   // 400, "BAD_REQUEST"
export class InternalError extends AppError     // 500, "INTERNAL_ERROR"
```

**Consumers**: All controllers and services throw these. `ErrorMiddleware` imports them for `instanceof` checks.

---

## Component: Error Middleware (`middleware/error.middleware.ts`)

**Pattern**: Error Envelope (Pattern 6), Middleware Chain (Pattern 8)

**Responsibility**: Express error-handling middleware (4-argument signature). Catches all thrown errors from route handlers and serializes them to the standard error envelope.

**Interface**:
```typescript
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void
```

**Behaviour**:
- `AppError` subclass → use `err.statusCode` and `err.code`
- Unknown error → `500, "INTERNAL_ERROR"` (message redacted in production)
- Log `error` level for 5xx, `warn` level for 4xx

**Registration**: Must be the last `app.use()` call in `index.ts`.

---

## Component: Health Controller (`controllers/health.controller.ts`)

**Pattern**: Health Check (Pattern 5)

**Responsibility**: Handles `GET /health`. Executes a `SELECT 1` DB query and returns readiness status.

**Interface**:
```typescript
export async function check(req: Request, res: Response): Promise<void>
// Returns 200 { status: "ok", db: "connected" }
// Returns 503 { status: "degraded", db: "unreachable" }
```

**Not wrapped in AuthMiddleware** — health check is unauthenticated.

---

## Component: Graceful Shutdown Handler (`lib/shutdown.ts`)

**Pattern**: Graceful Shutdown (Pattern 7)

**Responsibility**: Registers `SIGTERM` and `SIGINT` signal handlers. On signal receipt: stops accepting new connections, drains in-flight requests (5s timeout), disconnects Prisma, exits cleanly.

**Interface**:
```typescript
export function registerGracefulShutdown(server: http.Server): void
```

**Called by**: `index.ts` immediately after `app.listen()`.

---

## Component Interaction Diagram

```
process start
     |
     v
lib/env.ts                  ← validateEnv() — fail-fast
     |
     v
lib/db.ts                   ← connectWithRetry() — retry pattern
     |
     v
ContentService.initialize()  ← filesystem scan (Unit 3)
     |
     v
index.ts                    ← create Express app
     |
     +-- lib/logger.ts       ← singleton logger
     +-- lib/prisma.ts       ← singleton PrismaClient
     +-- lib/errors.ts       ← AppError classes
     |
     v
Middleware chain registered:
  express.json()
  cookie-parser()
  cors()
  routes (health, auth, content, progress, notes)
  middleware/error.middleware.ts   ← LAST
     |
     v
app.listen(PORT)
     |
     v
lib/shutdown.ts             ← registerGracefulShutdown()
     |
     v
Server ready
```

---

## Summary Table

| Component | File | Pattern(s) | Consumed By |
|-----------|------|-----------|-------------|
| Logger | `lib/logger.ts` | Singleton, Structured Logging | All files |
| PrismaClient | `lib/prisma.ts` | Singleton | All repositories, HealthController, startup |
| Env Validator | `lib/env.ts` | Fail-Fast | `index.ts` (startup only) |
| DB Connector | `lib/db.ts` | Retry | `index.ts` (startup only) |
| App Errors | `lib/errors.ts` | Error Envelope | All controllers, services, ErrorMiddleware |
| Error Middleware | `middleware/error.middleware.ts` | Error Envelope, Middleware Chain | `index.ts` (last middleware) |
| Health Controller | `controllers/health.controller.ts` | Health Check | `routes/health.ts` |
| Shutdown Handler | `lib/shutdown.ts` | Graceful Shutdown | `index.ts` (post-listen) |
