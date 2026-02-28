# Code Generation Plan — Unit 1: setup

## Unit Context

**Workspace root**: `/Users/codespeech/practice/DevOpsTeacher`
**Code location**: `portal/backend/` and `portal/frontend/` (greenfield multi-unit, portal/ subdirectory)
**Documentation**: `aidlc-docs/construction/setup/code/`

**Stories / requirements covered by this unit**:
- FR-07 (schema) — 4-table Prisma schema: users, exercise_progress, sessions, notes
- NFR-02 — secrets via .env, CORS config foundation
- NFR-04 — DB connection retry, graceful shutdown
- NFR-05 — Docker Compose (4 services), health endpoint, .env.example

**Dependencies**: None (Unit 1 is the foundation — no prior units)

**Interfaces exported to subsequent units**:
- `lib/prisma.ts` → PrismaClient singleton (Units 2–5)
- `lib/logger.ts` → pino logger (Units 2–5)
- `lib/errors.ts` → AppError classes (Units 2–5)
- `middleware/error.middleware.ts` → registered last in index.ts
- Prisma schema → all 4 models available to all units

---

## Step 1: Backend — package.json and tsconfig.json

**Files to create**:
- `portal/backend/package.json`
- `portal/backend/tsconfig.json`
- `portal/backend/.gitignore`

**Content**:
- `package.json`: dependencies (express, @prisma/client, passport, pino, cookie-parser, cors, dotenv, jsonwebtoken), devDependencies (typescript, ts-node-dev, jest, supertest, @types/*), scripts (dev, build, start, db:migrate, db:generate, test)
- `tsconfig.json`: strict mode, ES2022 target, CommonJS modules, rootDir=src, outDir=dist
- `.gitignore`: node_modules/, dist/, .env

**Story coverage**: NFR-05 (project scaffolding)

---

## Step 2: Frontend — package.json, tsconfig.json, vite.config.ts

**Files to create**:
- `portal/frontend/package.json`
- `portal/frontend/tsconfig.json`
- `portal/frontend/tsconfig.node.json`
- `portal/frontend/vite.config.ts`
- `portal/frontend/index.html`

**Content**:
- `package.json`: dependencies (react, react-dom, react-router-dom, zustand, @codemirror/*, react-markdown, axios), devDependencies (vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom)
- `tsconfig.json`: strict, ESNext, react-jsx
- `vite.config.ts`: react plugin, dev server proxy (`/api` and `/auth` → `http://localhost:3001`)
- `index.html`: standard Vite HTML entry

**Story coverage**: NFR-05 (frontend scaffolding)

---

## Step 3: Frontend — src scaffold

**Files to create**:
- `portal/frontend/src/main.tsx`
- `portal/frontend/src/App.tsx`
- `portal/frontend/src/api/.gitkeep`
- `portal/frontend/src/components/.gitkeep`
- `portal/frontend/src/pages/.gitkeep`
- `portal/frontend/src/stores/.gitkeep`

**Content**:
- `main.tsx`: minimal React root render (`<App />`)
- `App.tsx`: placeholder — renders `<div>DevOps Practice Portal — loading...</div>` (real routing in Unit 6)

**Story coverage**: NFR-05 (frontend scaffold)

---

## Step 4: Frontend — Dockerfile and nginx.conf

**Files to create**:
- `portal/frontend/Dockerfile`
- `portal/frontend/nginx.conf`

**Content**:
- `Dockerfile`: multi-stage — stage 1 builds with `node:20-alpine`, stage 2 serves with `nginx:alpine`
- `nginx.conf`: serves static files, fallback to `index.html` for SPA routing (handles React Router client-side routes)

**Story coverage**: NFR-05 (Docker deployment)

---

## Step 5: Prisma Schema

**Files to create**:
- `portal/backend/prisma/schema.prisma`

**Content**: Datasource (PostgreSQL), generator (prisma-client-js), 4 models:
- `User` — id, github_id (unique), username, avatar_url, created_at
- `ExerciseProgress` — id, user_id (→User), unit, exercise, status (ProgressStatus enum), updated_at; @@unique([user_id, unit, exercise])
- `Session` — id, user_id (→User), unit, exercise, started_at, ended_at?, duration_seconds?, is_active
- `Note` — id, user_id (→User), unit?, exercise?, content, updated_at; @@unique([user_id, unit, exercise])
- `ProgressStatus` enum: NotStarted, InProgress, Completed

**Story coverage**: FR-07, FR-03, FR-04, FR-05/06 (all 4 tables)

---

## Step 6: Core Library Files

**Files to create**:
- `portal/backend/src/lib/logger.ts`
- `portal/backend/src/lib/prisma.ts`
- `portal/backend/src/lib/errors.ts`
- `portal/backend/src/lib/env.ts`
- `portal/backend/src/lib/db.ts`
- `portal/backend/src/lib/shutdown.ts`

**Content**:
- `logger.ts`: pino instance, LOG_LEVEL from env, pino-pretty in development
- `prisma.ts`: PrismaClient singleton, query logging in dev
- `errors.ts`: AppError base class + NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError, InternalError subclasses
- `env.ts`: validateEnv() — checks 7 required vars, process.exit(1) if missing
- `db.ts`: connectWithRetry(maxAttempts=10, delayMs=2000) — retry loop with pino logging
- `shutdown.ts`: registerGracefulShutdown(server) — SIGTERM/SIGINT handler, 5s force-exit

**Story coverage**: NFR-02, NFR-04 (security + reliability patterns)

---

## Step 7: Error Middleware

**Files to create**:
- `portal/backend/src/middleware/error.middleware.ts`

**Content**: 4-argument Express error handler — maps AppError subclasses to HTTP status + `{ error: { code, message } }` envelope; logs 5xx at error level, 4xx at warn; unknown errors become 500 INTERNAL_ERROR

**Story coverage**: NFR-04 (reliability — consistent error handling)

---

## Step 8: Health Controller and Route

**Files to create**:
- `portal/backend/src/controllers/health.controller.ts`
- `portal/backend/src/routes/health.ts`

**Content**:
- `health.controller.ts`: async check() — `prisma.$queryRaw\`SELECT 1\`` → 200 `{status:"ok",db:"connected"}` or catch → 503 `{status:"degraded",db:"unreachable"}`
- `health.ts`: Express router, `GET /` → healthController.check

**Story coverage**: NFR-05 (health endpoint), NFR-04 (readiness check)

---

## Step 9: Express Entry Point

**Files to create**:
- `portal/backend/src/index.ts`
- `portal/backend/src/types/express.d.ts`

**Content**:
- `index.ts`: full startup sequence — validateEnv → connectWithRetry → express() → body parsers → cookie-parser → cors → mount routes (health; auth/content/progress/notes stubs added in later units) → errorMiddleware (LAST) → app.listen → registerGracefulShutdown
- `express.d.ts`: extends Express `Request` with `user?: { id: number }` (required by AuthMiddleware in Unit 2)

**Story coverage**: NFR-04 (startup sequence), NFR-05 (server bootstrap)

---

## Step 10: Backend Dockerfile

**Files to create**:
- `portal/backend/Dockerfile`

**Content**: multi-stage — stage 1 (`node:20-alpine`) installs deps + builds TypeScript; stage 2 (`node:20-alpine`) runs dist/ with only production deps; runs as non-root user

**Story coverage**: NFR-05 (Docker deployment)

---

## Step 11: Docker Compose, Caddyfile, env files

**Files to create**:
- `portal/docker-compose.yml`
- `portal/Caddyfile`
- `portal/.env.example`
- `portal/.gitignore`

**Content**: Per infrastructure-design.md — 4 services (postgres, backend, frontend, caddy), volumes, networks, healthchecks; Caddyfile with path-based routing; .env.example with all 9 vars documented with placeholder values; .gitignore excludes .env, node_modules, dist

**Story coverage**: NFR-05 (deployment), NFR-02 (secrets management)

---

## Step 12: Backend Unit Tests

**Files to create**:
- `portal/backend/src/__tests__/health.controller.test.ts`
- `portal/backend/src/__tests__/errors.test.ts`
- `portal/backend/src/__tests__/env.test.ts`
- `portal/backend/jest.config.js`

**Content**:
- `health.controller.test.ts`: mock prisma.$queryRaw — test 200 happy path, test 503 on DB error
- `errors.test.ts`: verify each AppError subclass has correct statusCode and code
- `env.test.ts`: test validateEnv exits on missing var, passes when all present
- `jest.config.js`: ts-jest preset, testEnvironment node

**Story coverage**: Test coverage for NFR-04, NFR-05 components

---

## Step 13: Code Documentation

**Files to create**:
- `aidlc-docs/construction/setup/code/code-summary.md`
- `portal/README.md`

**Content**:
- `code-summary.md`: lists all generated files with purpose (aidlc-docs only)
- `portal/README.md`: developer setup guide — prerequisites, local dev commands, first-deploy reference, env var table

**Story coverage**: NFR-05 (documentation)

---

## Generation Sequence Summary

| Step | What | Files |
|------|------|-------|
| 1 | Backend config | package.json, tsconfig.json, .gitignore |
| 2 | Frontend config | package.json, tsconfig, vite.config.ts, index.html |
| 3 | Frontend src scaffold | main.tsx, App.tsx, empty dirs |
| 4 | Frontend Docker | Dockerfile, nginx.conf |
| 5 | Prisma schema | schema.prisma |
| 6 | Core libraries | logger, prisma, errors, env, db, shutdown |
| 7 | Error middleware | error.middleware.ts |
| 8 | Health endpoint | health.controller.ts, health.ts route |
| 9 | Express entry point | index.ts, express.d.ts |
| 10 | Backend Dockerfile | Dockerfile |
| 11 | Compose + infra | docker-compose.yml, Caddyfile, .env.example, .gitignore |
| 12 | Backend tests | 3 test files + jest.config |
| 13 | Documentation | code-summary.md, portal README.md |

**Total**: 13 steps, ~30 files
