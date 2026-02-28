# Code Summary — Unit 1: setup

## Files Created

### portal/backend/

| File | Purpose |
|------|---------|
| `package.json` | Dependencies + scripts (dev, build, start, db:migrate, test) |
| `tsconfig.json` | TypeScript strict mode, ES2022, CommonJS |
| `Dockerfile` | Multi-stage: build (node:20-alpine) → production (non-root user) |
| `jest.config.js` | ts-jest preset, node test environment |
| `prisma/schema.prisma` | 4 models: User, ExerciseProgress, Session, Note; ProgressStatus enum |
| `src/index.ts` | Express entry point — full startup sequence |
| `src/types/express.d.ts` | Extends Express Request with `user?: { id: number }` |
| `src/lib/logger.ts` | pino singleton — JSON in prod, pino-pretty in dev |
| `src/lib/prisma.ts` | PrismaClient singleton — connection pool via DATABASE_URL |
| `src/lib/errors.ts` | AppError + 5 subclasses (NotFound, Unauthorized, Forbidden, BadRequest, Internal) |
| `src/lib/env.ts` | validateEnv() — checks 7 required vars, process.exit(1) if missing |
| `src/lib/db.ts` | connectWithRetry() — 10 attempts, 2s interval |
| `src/lib/shutdown.ts` | registerGracefulShutdown() — SIGTERM/SIGINT, 5s drain |
| `src/middleware/error.middleware.ts` | ErrorMiddleware — maps AppError to { error: { code, message } } |
| `src/controllers/health.controller.ts` | check() — SELECT 1 → 200 ok or 503 degraded |
| `src/routes/health.ts` | GET / → health.controller.check |
| `src/__tests__/errors.test.ts` | Unit tests for all AppError subclasses |
| `src/__tests__/env.test.ts` | Unit tests for validateEnv (all vars present / missing) |
| `src/__tests__/health.controller.test.ts` | Unit tests for health check (DB ok / DB fail) |

### portal/frontend/

| File | Purpose |
|------|---------|
| `package.json` | Dependencies (React, Zustand, CodeMirror, react-markdown, react-router-dom) |
| `tsconfig.json` | TypeScript strict, ESNext, react-jsx |
| `tsconfig.node.json` | TypeScript config for vite.config.ts |
| `vite.config.ts` | Vite + React plugin; dev proxy for /api, /auth, /health → localhost:3001 |
| `index.html` | HTML entry point |
| `Dockerfile` | Multi-stage: build (node:20-alpine) → serve (nginx:alpine) |
| `nginx.conf` | SPA fallback to index.html; static asset caching |
| `src/main.tsx` | React root render |
| `src/App.tsx` | Placeholder — full routing implemented in Unit 6 |

### portal/

| File | Purpose |
|------|---------|
| `docker-compose.yml` | 4 services: postgres, backend, frontend, caddy; volumes; portal_net network |
| `Caddyfile` | Path-based routing: /api/*, /auth/*, /health → backend; rest → frontend |
| `.env.example` | All 9 required environment variables documented with placeholders |
| `.gitignore` | Excludes .env, node_modules/, dist/, .prisma/ |

### portal/README.md

Developer setup guide (see file for full content).

## Story Coverage

| Requirement | Covered By |
|-------------|-----------|
| FR-07 (schema) | prisma/schema.prisma — users table |
| FR-03 (schema) | prisma/schema.prisma — exercise_progress table |
| FR-04 (schema) | prisma/schema.prisma — sessions table |
| FR-05/06 (schema) | prisma/schema.prisma — notes table |
| NFR-02 (secrets) | .env.example, .gitignore, CORS in index.ts |
| NFR-04 (reliability) | db.ts retry, shutdown.ts graceful exit, error.middleware.ts |
| NFR-05 (deployment) | docker-compose.yml, Caddyfile, health endpoint |
