# Unit of Work Plan — DevOps Practice Portal

## Decomposition Approach

The portal is a **single application (monolith)** with two deployable services that ship together via Docker Compose:

| Service | Description |
|---------|-------------|
| **backend** | Node.js + Express + TypeScript — REST API, Prisma ORM, Passport.js, JWT |
| **frontend** | React + Vite + TypeScript — SPA served by nginx in Docker |

The 6 units below are **sequential build stages**, not independent microservices. Each unit adds a vertical slice of functionality before the next unit begins.

---

## Questions

Two decisions are needed before generating the unit artifacts.

---

### Q1: Portal Directory Structure

The workspace root already contains `devops-challenges/` (read-only content). Where should the new portal code be placed?

A) **`portal/` subdirectory** — `portal/backend/` and `portal/frontend/` — keeps all portal code isolated in one named folder alongside `devops-challenges/`

B) **Workspace root** — `backend/` and `frontend/` live directly at the top level alongside `devops-challenges/`

C) Other (describe below)

[Answer]: A — `portal/` subdirectory (`portal/backend/` and `portal/frontend/`)

---

### Q2: Package Management Strategy

How should Node.js dependencies be managed across backend and frontend?

A) **Separate `package.json` per package** — `backend/package.json` and `frontend/package.json` — each package installs and runs independently

B) **npm workspaces** — single root `package.json` with `workspaces: ["backend", "frontend"]` — `npm install` at root installs everything; scripts run from root

C) Other (describe below)

[Answer]: A — Separate `package.json` per package (independent installs)

---

## Artifact Generation Steps

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`
  - Unit definitions and responsibilities
  - Code organization strategy (directory layout from Q1 + Q2)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
  - Build order dependency matrix
  - Inter-unit interface contracts
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
  - Functional requirements (FR-01 to FR-08) mapped to units
  - NFR coverage across units
- [x] Validate unit boundaries — all 13 requirements (FR-01–FR-08, NFR-01–NFR-05) covered
- [x] Verify all 6 units have clear entry/exit criteria

---

## Unit Definitions (Preliminary)

| # | Unit | Type | Summary |
|---|------|------|---------|
| 1 | **setup** | Backend + Infra | Project scaffolding, TypeScript config, Docker Compose, Prisma schema + migrations, env configuration |
| 2 | **auth** | Backend | GitHub OAuth with Passport.js, JWT httpOnly cookies, UserRepository, AuthMiddleware |
| 3 | **content-api** | Backend | ContentService filesystem reader, in-memory cache, REST endpoints for units index + file content |
| 4 | **progress** | Backend + Frontend | ExerciseProgress CRUD, Session start/stop/accumulate, TimerWidget, StatusSelector |
| 5 | **notes** | Backend + Frontend | Per-exercise notes + global scratch pad CRUD, NotesEditor (CodeMirror), auto-save |
| 6 | **frontend-shell** | Frontend | React + Vite SPA, React Router, AppLayout, AuthPage, UnitBrowser, ExerciseBrowser, Dashboard |

**Build order**: 1 → 2 → 3 → 4 → 5 → 6 (each unit depends on the previous)

---

## Build Dependency Summary

```
Unit 1: setup
  └─► Unit 2: auth        (needs DB schema and Prisma client)
        └─► Unit 3: content-api   (needs AuthMiddleware)
              └─► Unit 4: progress       (needs auth + content endpoints)
                    └─► Unit 5: notes          (needs auth + content endpoints)
                          └─► Unit 6: frontend-shell  (wires all backend units together)
```

---

## Completion Criteria

- Q1 and Q2 answered with no ambiguity
- All 3 artifacts generated
- Every FR and NFR from `portal-requirements.md` assigned to at least one unit
- All 6 units have defined entry criteria and output deliverables
