# Business Rules — Unit 3: content-api

## BR-01 — Initialize Once at Startup

`ContentService.initialize()` is called once during server startup (in `main()`, after `connectWithRetry()` and before routes are registered). It scans `CONTENT_PATH` to build `ContentIndex`. If `CONTENT_PATH` does not exist or is unreadable, the server must log a fatal error and exit with code 1.

## BR-02 — ContentIndex Structure

The index is a `Map<string, Set<string>>` where keys are unit directory names and values are sets of exercise directory names. Only directories (not files) at each level are included. Entries are sorted alphabetically.

## BR-03 — Param Validation Before Filesystem Access (Defence-in-Depth)

All three params — `unit`, `exercise`, `file` — must be validated before any filesystem operation:

1. `unit` must exist as a key in `ContentIndex` → else `NotFoundError('Unit not found')`
2. `exercise` must exist in `ContentIndex.get(unit)` → else `NotFoundError('Exercise not found')`
3. `file` must not contain path separators (`/`, `\`) or `..` sequences → else `NotFoundError('File not found')`
4. The resolved file path must exist on disk → else `NotFoundError('File not found')`

> The index validation (rules 1–2) catches unknown unit/exercise values. Rule 3 prevents path traversal for the filename segment. Rule 4 handles valid-unit/valid-exercise but missing file (e.g., a file that wasn't generated for that exercise).

## BR-04 — File Cache (Lazy, Permanent)

On first read of any `(unit, exercise, file)` combination, content is read from disk and stored in `FileCache` with key `"${unit}/${exercise}/${file}"`. On subsequent requests for the same key, content is served from cache — no filesystem read.

The cache is never invalidated during the server's lifetime. Content is read-only and does not change at runtime.

## BR-05 — `GET /api/content/units` Response

Returns `200` with body:
```json
{ "units": [ { "unit": "docker", "exercises": ["01-...", "02-...", ...] }, ... ] }
```
Units and exercises are sorted alphabetically. Response is served from the in-memory `ContentIndex` — no filesystem read per request.

## BR-06 — `GET /api/content/:unit/:exercise/:file` Response

Returns `200` with body:
```json
{ "content": "<raw file text>" }
```
Content is the raw UTF-8 text of the file. The server does not parse markdown, transform paths, or modify the content in any way.

## BR-07 — Route Protection

Both content routes are protected by `AuthMiddleware`. Unauthenticated requests return `401`.

## BR-08 — No Write Path

`ContentService` has no write methods. No route accepts `POST`, `PUT`, or `DELETE` on `/api/content/*`. The `CONTENT_PATH` directory is never modified by the server.
