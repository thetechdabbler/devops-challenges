# NFR Requirements — Unit 3: content-api

## Inherited from Unit 1 (unchanged)
Concurrent users: 2–5, pino logging, Docker Compose deployment, no rate limiting.

## Performance
- **PR-01 Cache**: All file reads cached after first access. At full warmup (~240 files × ~8KB avg = ~2MB), cache fits comfortably in Node.js heap.
- **PR-02 Sync reads acceptable**: `fs.readFileSync` used for both startup scan and first file read. For 2–5 users, event-loop blocking during cold-cache reads (~1ms per file) is negligible. Post-warmup all reads are pure in-memory.
- **PR-03 Index served from memory**: `GET /api/content/units` is a pure Map iteration — no I/O.

## Security
- **SR-01 AuthMiddleware**: Both content routes require valid JWT cookie (Unit 2).
- **SR-02 No write path**: `ContentService` has zero write methods; no route accepts mutating verbs.
- **SR-03 Param validation**: All three path params validated against ContentIndex before filesystem access (defence-in-depth, BR-03).
- **SR-04 No new packages**: Uses only Node.js built-ins (`fs`, `path`) — zero additional attack surface.

## Reliability
- **RR-01 Fail-fast on bad CONTENT_PATH**: `process.exit(1)` if `CONTENT_PATH` missing at startup.
- **RR-02 NotFoundError propagation**: Unknown unit/exercise/file → `NotFoundError` → `ErrorMiddleware` → `404 { error: { code, message } }`. Server never crashes on missing content.
