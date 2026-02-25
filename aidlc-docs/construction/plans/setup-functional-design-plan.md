# Functional Design Plan — Unit 1: setup

## Unit Context

**Responsibilities**: Project scaffolding, TypeScript config, Docker Compose, Prisma schema + migrations, env config, health endpoint.

**Requirements covered**: FR-07 (schema), FR-03 (schema), FR-04 (schema), FR-05/06 (schema), NFR-02 (secrets), NFR-04 (DB reliability), NFR-05 (deployment).

---

## Functional Design Questions

Unit 1's core functional deliverables are the data schema and application startup/error contracts. Three decisions need your input before the design artifacts can be generated.

---

### Q1: ProgressStatus Enum Format

The `exercise_progress` table uses a `status` enum with three values (Not Started / In Progress / Completed). What should the enum values look like in the database and Prisma schema?

A) `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` — SCREAMING_SNAKE_CASE (common SQL convention)

B) `not_started`, `in_progress`, `completed` — lowercase snake_case (Prisma native style)

C) `NotStarted`, `InProgress`, `Completed` — PascalCase (TypeScript enum style, maps cleanly to frontend enums)

[Answer]: C

---

### Q2: Health Endpoint Depth

`GET /health` is required for Docker Compose health checks and VPS uptime monitoring. What should it verify?

A) **Liveness only** — always returns `200 { status: "ok" }` immediately (fast, simple; reports that the process is running)

B) **Readiness** — queries the database on each call; returns `200 { status: "ok", db: "connected" }` if healthy, `503 { status: "degraded", db: "unreachable" }` if DB is down

[Answer]: B

---

### Q3: Error Response JSON Shape

`ErrorMiddleware` intercepts all unhandled errors and must return a consistent JSON shape. What envelope should it use?

A) **Simple** — `{ "error": "human-readable message string" }`

B) **Structured** — `{ "error": { "code": "NOT_FOUND", "message": "Exercise not found" } }` — includes a machine-readable code alongside the message

C) **HTTP-style** — `{ "status": 404, "message": "Exercise not found" }` — mirrors HTTP status in the body

[Answer]: B

---

### Q4: Startup DB Wait Behavior

NFR-04 requires the backend to retry PostgreSQL connections on startup. What should the retry strategy be if the database is not ready when the server starts?

A) **Fail fast** — attempt connection once; exit with non-zero code if it fails (Docker Compose `restart: unless-stopped` handles restart)

B) **Retry with backoff** — retry up to N times with a wait between attempts before giving up (server stays alive, logs each attempt)

[Answer]: B

---

## Artifact Generation Steps

- [x] Create `aidlc-docs/construction/setup/functional-design/domain-entities.md`
  - Prisma schema entity definitions (all 4 tables)
  - Enum definitions with chosen format
  - Unique constraints and relationships
- [x] Create `aidlc-docs/construction/setup/functional-design/business-rules.md`
  - Health check behaviour
  - Error response format and error type catalogue
  - Startup initialization sequence and DB wait rules
  - Environment variable validation rules
- [x] Create `aidlc-docs/construction/setup/functional-design/business-logic-model.md`
  - Application initialization flow
  - Middleware registration order
  - Request lifecycle
