# Business Rules — Unit 1: setup

---

## BR-01: Health Endpoint (Readiness Check)

`GET /health` performs a lightweight database connectivity check on every call.

**Healthy response** (DB reachable):
```json
HTTP 200 OK
{ "status": "ok", "db": "connected" }
```

**Degraded response** (DB unreachable):
```json
HTTP 503 Service Unavailable
{ "status": "degraded", "db": "unreachable" }
```

**Query used**: `SELECT 1` (minimal DB round-trip, accesses no business tables).

**Auth**: The health endpoint is NOT protected by `AuthMiddleware`. It must be accessible without a JWT cookie — Docker health checks and external monitors do not authenticate.

**Error handling**: Any database query error is caught and results in the 503 degraded response. The endpoint must never return 5xx from an unhandled exception.

---

## BR-02: Error Response Format

All API error responses use this JSON envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of the error"
  }
}
```

**Standard error code catalogue**:

| Code | HTTP Status | When Used |
|------|------------|-----------|
| `UNAUTHORIZED` | 401 | Missing JWT cookie or invalid/expired token |
| `FORBIDDEN` | 403 | Valid JWT but user does not own the requested resource |
| `NOT_FOUND` | 404 | Resource does not exist (missing file, exercise, note, session) |
| `BAD_REQUEST` | 400 | Invalid request body — missing required fields or invalid enum value |
| `CONFLICT` | 409 | Uniqueness violation (reserved for future use) |
| `INTERNAL_ERROR` | 500 | Unhandled exception or unexpected server state |

**ErrorMiddleware responsibility**:
1. Receive thrown error object from any route handler
2. Inspect error type/code to determine HTTP status and `code` string
3. Serialize using the envelope above
4. Log the error server-side (full stack trace for 5xx, message only for 4xx)
5. Any unrecognized error type → `INTERNAL_ERROR` + 500

**Validation errors** (400): The `message` field describes which field failed and why (e.g., `"status must be one of: NotStarted, InProgress, Completed"`).

---

## BR-03: Startup Database Connection (Retry with Backoff)

The backend must not accept HTTP requests until a database connection is confirmed.

**Retry strategy**:
- Maximum retry attempts: **10**
- Wait between attempts: **2 seconds** (fixed interval — no exponential backoff)
- Log each failed attempt: `DB connection attempt {N}/10 failed: {error.message}`
- After 10 failures: log `FATAL: Could not connect to database after 10 attempts`, then `process.exit(1)`

**Startup sequence (enforced order)**:
```
1. Validate environment variables   → BR-04
2. PrismaClient.$connect() with retry
3. ContentService.initialize()       → scans devops-challenges/
4. Register Express middleware
5. Mount routes
6. app.listen(PORT)
```

The HTTP listener is started only at step 6 — no requests are accepted while steps 1–5 are in progress.

---

## BR-04: Environment Variable Validation

All required environment variables must be present at startup. Validation runs before any other initialization.

**Required variables**:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret key for signing and verifying JWTs |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application client secret |
| `FRONTEND_URL` | Allowed CORS origin (e.g., `http://localhost:5173`) |
| `CONTENT_PATH` | Absolute path to the `devops-challenges/` directory |
| `PORT` | Port the Express server listens on |

**On any missing variable**:
```
FATAL: Missing required environment variable: {VAR_NAME}
```
Then `process.exit(1)` immediately — no further initialization proceeds.

**Validation method**: Check `process.env[VAR_NAME]` is defined and non-empty string. No format validation (e.g., URL format) — only presence check.

---

## BR-05: ProgressStatus Default

When an `ExerciseProgress` record is first created via upsert, the `status` field defaults to `NotStarted` if not explicitly provided.

Exercises that have never been interacted with have no record in the DB. The application treats a missing record as equivalent to `NotStarted` — callers must not assume a 404 means "error"; it means "not yet started".

---

## BR-06: Note Content Default

When a `Note` record is first created via upsert (user opens a note area for the first time), the `content` field is initialized to an empty string `""`.

An empty-string note is a valid, non-error state. The frontend renders an empty CodeMirror editor.

---

## BR-07: Global Scratch Pad Uniqueness

A global scratch pad note has `unit = null AND exercise = null`. The application enforces that these two fields are always set together:

- If `unit` is null, `exercise` must also be null (global note).
- If `unit` is non-null, `exercise` must also be non-null (per-exercise note).

Mixed state (`unit = null, exercise = "some-exercise"` or vice versa) is rejected with a `BAD_REQUEST` error.
