# Tech Stack Decisions — Unit 1: setup

---

## Decision 1: Logging Library — `pino`

**Choice**: `pino`

**Rationale**:
- Fastest Node.js JSON logger (benchmarked against winston and bunyan)
- Structured JSON output integrates with any log aggregator (Loki, Datadog, ELK) if needed later
- `pino-pretty` dev dependency for human-readable local output
- Low overhead — important for API endpoints with < 300ms target

**Usage pattern**:
```
lib/logger.ts           -- creates and exports the pino instance
index.ts                -- imports logger, passes to app
controllers/            -- log.info / log.warn / log.error per request
middleware/error.ts     -- log.error(err) for all 5xx
```

**Log level control**: `LOG_LEVEL` environment variable (default: `info` in production, `debug` in development).

---

## Decision 2: Rate Limiting — None

**Choice**: No rate limiting

**Rationale**:
- 2–5 known users on a private instance
- Not a public API — GitHub OAuth is the first layer of access control
- Adding `express-rate-limit` adds complexity without meaningful security benefit for this use case
- Revisit if the instance becomes publicly accessible

---

## Decision 3: PostgreSQL Connection Pool Size — 5

**Choice**: Explicitly set Prisma connection pool to **5 connections**

**Rationale**:
- 2–5 concurrent users each making sequential API calls (browse → load exercise → update status)
- Prisma's default formula is `num_physical_cpus * 2 + 1` — on a 1-2 CPU VPS this gives 3–5, which aligns
- Setting explicitly to 5 makes the intent clear and prevents surprises across different VPS sizes

**Implementation**:
```
DATABASE_URL="postgresql://...?connection_limit=5"
```
The `connection_limit` query parameter is set in `DATABASE_URL`, not in code — environment-configurable without redeployment.

---

## Decision 4: Node.js Version — 20 LTS

**Choice**: Node.js **20 LTS**

**Rationale**:
- Current Long-Term Support release
- Supported through April 2026; upgradeable to Node 22 LTS later
- Stable native `fetch`, modern ES module support, good TypeScript compatibility

**Docker image**: `node:20-alpine` — minimal footprint, well-maintained.

---

## Decision 5: PostgreSQL Version — 16

**Choice**: PostgreSQL **16**

**Rationale**:
- Latest stable release at project start
- Full compatibility with all Prisma features used (enums, nullable unique indexes, `@updatedAt`)
- Docker image: `postgres:16-alpine`

---

## Decision 6: TypeScript Configuration — Strict Mode

**Choice**: `strict: true` in `tsconfig.json`

**Strict mode enables**:
- `strictNullChecks` — catches null/undefined handling at compile time (critical for nullable DB fields)
- `noImplicitAny` — all function parameters and return types must be typed
- `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`

**Target**: `ES2022` — matches Node 20's native support; no unnecessary transpilation overhead.

**Module**: `CommonJS` for the backend (Express ecosystem compatibility); frontend uses `ESNext` (Vite handles bundling).

---

## Decision 7: Docker Compose Service Configuration

| Service | Image | Restart Policy | Health Check |
|---------|-------|---------------|--------------|
| `postgres` | `postgres:16-alpine` | `unless-stopped` | `pg_isready` |
| `backend` | Custom `node:20-alpine` build | `unless-stopped` | `GET /health` |
| `frontend` | Custom `nginx:alpine` build | `unless-stopped` | None (nginx serves static files) |

**Dependency order**: `backend` depends on `postgres` (healthy); `frontend` has no runtime dependency on `backend` (static SPA, calls API at runtime from the browser).

---

## Decision 8: Graceful Shutdown

**Choice**: Handle `SIGTERM` and `SIGINT` signals

**Sequence**:
1. Stop accepting new HTTP connections (`server.close()`)
2. Wait for in-flight requests to complete (5s timeout)
3. `prisma.$disconnect()`
4. `process.exit(0)`

This ensures clean container shutdown when `docker-compose down` sends `SIGTERM`.
