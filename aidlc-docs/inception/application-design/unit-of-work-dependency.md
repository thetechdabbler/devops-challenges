# Unit of Work — Dependency Matrix
# DevOps Practice Portal

---

## Hard Dependencies (Build Order)

| Unit | Depends On | Reason |
|------|-----------|--------|
| 1 — setup | None | Foundation unit — creates DB schema, Docker Compose, Express skeleton |
| 2 — auth | 1 — setup | Needs `PrismaClient` + `users` table; Express app must be running |
| 3 — content-api | 2 — auth | `AuthMiddleware` must exist to protect content routes |
| 4 — progress | 3 — content-api | Needs `AuthMiddleware`; `exercise_progress` + `sessions` tables from schema; frontend needs content endpoints for exercise context |
| 5 — notes | 3 — content-api | Needs `AuthMiddleware`; `notes` table from schema; frontend needs content endpoints to wire `NotesEditor` to exercises |
| 6 — frontend-shell | 2, 3, 4, 5 | `apiClient.ts` calls all 16 backend endpoints; wires every component and store into the SPA |

---

## Build Order Diagram

```
Unit 1: setup
  └─► Unit 2: auth
        └─► Unit 3: content-api
              ├─► Unit 4: progress    ─────────────────┐
              └─► Unit 5: notes       ─────────────────┤
                                                        ▼
                                              Unit 6: frontend-shell
```

Units 4 and 5 are independent of each other at the backend level and can be implemented in parallel after Unit 3. Unit 6 depends on all preceding units.

---

## Interface Contracts Between Units

### Unit 1 → Unit 2

Unit 1 exports:
| Artifact | Location | Description |
|----------|----------|-------------|
| `PrismaClient` singleton | `backend/src/lib/prisma.ts` | Shared DB client used by all repositories |
| Prisma schema | `backend/prisma/schema.prisma` | Defines `User`, `ExerciseProgress`, `Session`, `Note` models |
| Express app factory | `backend/src/index.ts` | Registers middleware and mounts routers |
| Env vars | `.env.example` | `DATABASE_URL`, `JWT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `FRONTEND_URL`, `CONTENT_PATH` |

---

### Unit 2 → Units 3, 4, 5, 6

Unit 2 exports:
| Artifact | Location | Description |
|----------|----------|-------------|
| `AuthMiddleware` | `backend/src/middleware/auth.middleware.ts` | Applied to all `/api/*` routes |
| `req.user` type | `backend/src/types/express.d.ts` | `{ id: number }` attached to authenticated requests |
| Auth routes | Registered in Express | `/auth/github`, `/auth/github/callback`, `POST /api/auth/logout`, `GET /api/me` |

---

### Unit 3 → Units 4, 5, 6

Unit 3 exports:
| Artifact | Location | Description |
|----------|----------|-------------|
| Content endpoints | Registered in Express | `GET /api/content/units`, `GET /api/content/:unit/:exercise/:file` |
| `UnitMeta` type | `backend/src/types/content.types.ts` | `{ unit: string, exercises: ExerciseMeta[] }` |
| `ExerciseMeta` type | `backend/src/types/content.types.ts` | `{ slug: string, name: string, files: string[] }` |

---

### Unit 4 → Unit 6

Unit 4 exports:
| Artifact | Location | Description |
|----------|----------|-------------|
| Progress endpoints | Registered in Express | `GET /api/progress`, `PUT /api/progress/:unit/:exercise` |
| Session endpoints | Registered in Express | `POST /api/sessions/start`, `POST /api/sessions/end`, `GET /api/sessions/:unit/:exercise` |
| `useProgressStore` | `frontend/src/stores/progress.store.ts` | Zustand store — `load`, `updateStatus`, `startSession`, `endSession` |
| `TimerWidget` | `frontend/src/components/TimerWidget.tsx` | Drop-in timer component for `ExerciseViewer` |
| `StatusSelector` | `frontend/src/components/StatusSelector.tsx` | Drop-in status component for `ExerciseViewer` |

---

### Unit 5 → Unit 6

Unit 5 exports:
| Artifact | Location | Description |
|----------|----------|-------------|
| Notes endpoints | Registered in Express | `GET/PUT /api/notes/:unit/:exercise`, `GET/PUT /api/notes/global` |
| `useNotesStore` | `frontend/src/stores/notes.store.ts` | Zustand store — `getNote`, `saveNote` |
| `NotesEditor` | `frontend/src/components/NotesEditor.tsx` | Drop-in CodeMirror editor for `ExerciseViewer` |
| `GlobalScratchPad` | `frontend/src/components/GlobalScratchPad.tsx` | Drop-in global note for `AppLayout` sidebar |

---

## Environment Variables by Unit

| Variable | Set In | Consumed By |
|----------|--------|------------|
| `DATABASE_URL` | Unit 1 | Unit 1 (Prisma migrations), Units 2–5 (via PrismaClient) |
| `JWT_SECRET` | Unit 1 | Unit 2 (sign/verify JWT) |
| `GITHUB_CLIENT_ID` | Unit 1 | Unit 2 (Passport.js strategy) |
| `GITHUB_CLIENT_SECRET` | Unit 1 | Unit 2 (Passport.js strategy) |
| `FRONTEND_URL` | Unit 1 | Unit 2 (CORS origin, OAuth redirect) |
| `CONTENT_PATH` | Unit 1 | Unit 3 (absolute path to devops-challenges/) |
| `PORT` | Unit 1 | Unit 1 (Express listen) |
| `NODE_ENV` | Unit 1 | All units (dev vs production behaviour) |
