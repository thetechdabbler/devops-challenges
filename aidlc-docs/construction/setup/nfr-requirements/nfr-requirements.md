# NFR Requirements — Unit 1: setup

---

## Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent users | 2–5 simultaneous users |
| Scaling model | Single VPS instance — no horizontal scaling planned |
| Database connections | Prisma connection pool capped at **5 connections** (sufficient for 2–5 users, each user making sequential API calls) |
| Growth trigger | If user count exceeds 10, revisit pool size and VPS resources |

No message queues, caches, or external services beyond PostgreSQL. All scaling is vertical (bigger VPS) if needed.

---

## Performance

| Requirement | Target |
|-------------|--------|
| Health check response time | < 100ms (includes DB `SELECT 1` round-trip) |
| Progress / notes API endpoints | < 300ms p95 (per NFR-01) |
| Content API (cached) | < 50ms p95 (served from in-memory cache after first read) |
| Server cold start (DB retry included) | < 30s in normal conditions (DB ready on first or second attempt) |
| Server startup (DB already up) | < 5s |

Content file reads happen at most once per file per server process lifetime — subsequent requests are sub-millisecond from the in-memory cache.

---

## Availability

| Requirement | Target |
|-------------|--------|
| Uptime expectation | Best-effort on a single VPS — no SLA |
| Restart strategy | Docker Compose `restart: unless-stopped` — automatic restart after crash |
| Recovery time | < 30s (Docker restarts the container; DB retry loop handles delayed DB readiness) |
| Planned downtime | Manual — no rolling updates; restart requires brief downtime |
| Backup strategy | Out of scope (Operations phase) |

This is a personal learning tool — brief downtime is acceptable.

---

## Security

| Requirement | Specification |
|-------------|--------------|
| Authentication | GitHub OAuth only — no passwords stored |
| Token storage | JWT in `httpOnly; SameSite=Strict; Secure` cookie — not localStorage |
| API protection | All `/api/*` routes require valid JWT via `AuthMiddleware` |
| CORS | Restricted to `FRONTEND_URL` env var — configured per environment |
| Secret management | All secrets via `.env` file — never committed; `.env.example` documents required vars with no real values |
| Rate limiting | None — 2–5 known users, not a public-facing service |
| Content access | Content API is strictly read-only — no write path to `devops-challenges/` |
| SQL injection | Protected by Prisma's parameterized queries — no raw string interpolation in SQL |
| HTTPS | Handled at reverse proxy / VPS network layer — the Express app itself serves HTTP; TLS termination is infrastructure |

---

## Reliability

| Requirement | Specification |
|-------------|--------------|
| DB connection retry | 10 attempts, 2s fixed interval, `process.exit(1)` after all fail (BR-03) |
| Missing env vars | Immediate `process.exit(1)` with named variable in message (BR-04) |
| Unhandled errors | Caught by `ErrorMiddleware` — always return structured JSON, never crash the process |
| Missing content files | Graceful `NOT_FOUND` 404 response — no server crash |
| Graceful shutdown | On `SIGTERM`/`SIGINT`: close HTTP server, then `PrismaClient.$disconnect()` |

---

## Maintainability

| Requirement | Specification |
|-------------|--------------|
| Logging library | **`pino`** — structured JSON output to stdout |
| Log levels | `error`, `warn`, `info`, `debug` — controlled by `LOG_LEVEL` env var (default `info`) |
| Log format | JSON: `{ level, time, msg, [context fields] }` — readable via `pino-pretty` in development |
| TypeScript | Strict mode enabled — `strict: true` in `tsconfig.json` |
| Code structure | Controllers → Services → Repositories — no layer skipping |
| Error tracing | All 5xx errors logged with full stack trace at `error` level; 4xx logged at `warn` level with request context |

---

## Deployment

| Requirement | Specification |
|-------------|--------------|
| Startup command | `docker-compose up` — starts backend, frontend (nginx), postgres in correct order |
| Environment config | `.env` file at `portal/` root — one file for all services |
| Health check | `GET /health` — used by Docker Compose `healthcheck` directive |
| Node.js version | **20 LTS** (current LTS, supported until April 2026) |
| PostgreSQL version | **16** (latest stable) |
| Container restart | `restart: unless-stopped` on all services |
