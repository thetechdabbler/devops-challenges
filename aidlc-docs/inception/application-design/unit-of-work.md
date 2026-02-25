# Units of Work — DevOps Practice Portal

---

## Code Organization Strategy

**Directory layout** (Q1: `portal/` subdirectory):

```
DevOpsTeacher/
├── devops-challenges/          (existing, read-only content source)
├── portal/
│   ├── backend/                (Node.js + Express + TypeScript)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── lib/
│   │       └── index.ts
│   ├── frontend/               (React + Vite + TypeScript)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── api/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── stores/
│   │       └── main.tsx
│   ├── docker-compose.yml
│   └── .env.example
└── aidlc-docs/
```

**Package management** (Q2: separate `package.json` per package):
- `portal/backend/package.json` — backend dependencies and scripts (`dev`, `build`, `start`, `db:migrate`, `db:seed`)
- `portal/frontend/package.json` — frontend dependencies and scripts (`dev`, `build`, `preview`)
- Docker Compose handles runtime orchestration — no root-level package.json needed

---

## Unit 1: setup

**Type**: Foundation + Infrastructure
**Builds on**: Nothing (first unit)

**Responsibilities**:
- Initialize `portal/backend/` and `portal/frontend/` directory skeletons
- Configure TypeScript (`tsconfig.json`) for both packages
- Set up Express application skeleton with global error middleware
- Define Prisma schema with all 4 tables: `users`, `exercise_progress`, `sessions`, `notes`
- Run initial Prisma migration
- Write Docker Compose config: `backend`, `frontend` (nginx), and `postgres` services
- Write `.env.example` with all required environment variables
- Implement `GET /health` endpoint

**Key deliverables**:
```
portal/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── prisma/schema.prisma
│   └── src/
│       ├── index.ts              (Express app wiring)
│       ├── lib/prisma.ts         (PrismaClient singleton)
│       ├── middleware/error.middleware.ts
│       └── routes/health.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── Dockerfile
```

**Exit criteria**: `docker-compose up` starts all 3 services; `GET /health` returns `{ status: "ok" }`; Prisma migration applied with all 4 tables.

---

## Unit 2: auth

**Type**: Backend
**Builds on**: Unit 1 (Prisma client + `users` table + Express app)

**Responsibilities**:
- Implement `UserRepository` (`findByGithubId`, `upsert`)
- Implement `AuthService` (`upsertUser`, `generateJWT`, `verifyJWT`)
- Implement `AuthController` (`initiateGitHubOAuth`, `handleOAuthCallback`, `logout`, `getMe`)
- Implement `AuthMiddleware` (JWT extraction from httpOnly cookie, verification, `req.user` attachment)
- Wire auth routes: `GET /auth/github`, `GET /auth/github/callback`, `POST /api/auth/logout`, `GET /api/me`
- Configure Passport.js GitHub strategy
- Configure CORS to allow only `FRONTEND_URL`

**Key deliverables**:
```
backend/src/
├── controllers/auth.controller.ts
├── services/auth.service.ts
├── repositories/user.repository.ts
├── middleware/auth.middleware.ts
└── routes/auth.routes.ts
```

**Exit criteria**: Full OAuth flow completes (GitHub → callback → JWT cookie set); `GET /api/me` returns user profile; unprotected request to `/api/*` returns 401.

---

## Unit 3: content-api

**Type**: Backend
**Builds on**: Unit 2 (`AuthMiddleware` must exist to protect content routes)

**Responsibilities**:
- Implement `ContentService` (`initialize` on startup, `getUnitsIndex`, `getFileContent` with in-memory cache)
- Implement `ContentController` (`listUnits`, `getFile`)
- Wire content routes: `GET /api/content/units`, `GET /api/content/:unit/:exercise/:file`
- Mount `devops-challenges/` path from `CONTENT_PATH` environment variable

**Key deliverables**:
```
backend/src/
├── controllers/content.controller.ts
├── services/content.service.ts
└── routes/content.routes.ts
```

**Exit criteria**: `GET /api/content/units` returns all 8 units with exercise metadata; `GET /api/content/docker/01-build-your-first-container/challenge.md` returns markdown string; second call served from cache (no filesystem read).

---

## Unit 4: progress

**Type**: Backend + Frontend
**Builds on**: Unit 3 (auth middleware; content endpoints for frontend context)

**Backend responsibilities**:
- Implement `ProgressRepository` (`findAllByUser`, `upsert`)
- Implement `SessionRepository` (`create`, `endActive`, `findByExercise`)
- Implement `ProgressService` (`getAllForUser`, `upsert`)
- Implement `SessionService` (`start`, `end`, `getForExercise`)
- Implement `ProgressController` (`getAllProgress`, `updateProgress`)
- Implement `SessionsController` (`startSession`, `endSession`, `getExerciseSessions`)
- Wire routes: `GET /api/progress`, `PUT /api/progress/:unit/:exercise`, `POST /api/sessions/start`, `POST /api/sessions/end`, `GET /api/sessions/:unit/:exercise`

**Frontend responsibilities**:
- Implement `useProgressStore` (Zustand — `load`, `updateStatus`, `startSession`, `endSession`)
- Implement `TimerWidget` component (HH:MM:SS display, Start/Stop, resume active session on mount)
- Implement `StatusSelector` component (Not Started / In Progress / Completed)

**Key deliverables**:
```
backend/src/
├── controllers/progress.controller.ts
├── controllers/sessions.controller.ts
├── services/progress.service.ts
├── services/session.service.ts
├── repositories/progress.repository.ts
├── repositories/session.repository.ts
└── routes/progress.routes.ts + sessions.routes.ts

frontend/src/
├── stores/progress.store.ts
└── components/
    ├── TimerWidget.tsx
    └── StatusSelector.tsx
```

**Exit criteria**: Progress status persists across page refresh; timer survives page reload (active session restored from DB on mount); total time accumulates correctly across multiple sessions.

---

## Unit 5: notes

**Type**: Backend + Frontend
**Builds on**: Unit 3 (auth middleware; exercise context for per-exercise note keys)

**Backend responsibilities**:
- Implement `NoteRepository` (`findByExercise` with nullable unit/exercise for global, `upsert`)
- Implement `NoteService` (`get`, `upsert` — global vs per-exercise distinguished by `unit = null AND exercise = null`)
- Implement `NotesController` (`getNote`, `saveNote` — handles both exercise and global routes)
- Wire routes: `GET /api/notes/:unit/:exercise`, `PUT /api/notes/:unit/:exercise`, `GET /api/notes/global`, `PUT /api/notes/global`

**Frontend responsibilities**:
- Implement `useNotesStore` (Zustand — `getNote`, `saveNote`)
- Implement `NotesEditor` component (CodeMirror editor + debounced auto-save at 1-second + preview toggle)
- Implement `GlobalScratchPad` component (wrapper around `NotesEditor` for global note, no unit/exercise)

**Key deliverables**:
```
backend/src/
├── controllers/notes.controller.ts
├── services/note.service.ts
├── repositories/note.repository.ts
└── routes/notes.routes.ts

frontend/src/
├── stores/notes.store.ts
└── components/
    ├── NotesEditor.tsx
    └── GlobalScratchPad.tsx
```

**Exit criteria**: Notes auto-save after 1-second debounce; per-exercise note and global scratch pad stored in separate DB rows; CodeMirror renders with preview toggle.

---

## Unit 6: frontend-shell

**Type**: Frontend
**Builds on**: Units 2, 3, 4, 5 (all backend endpoints must be available)

**Responsibilities**:
- Set up React Router v6 with routes:
  - `/` — `AuthPage`
  - `/auth/callback` — `OAuthCallback`
  - `/dashboard` — `Dashboard`
  - `/units` — `UnitBrowser`
  - `/units/:unit` — `ExerciseBrowser`
  - `/units/:unit/:exercise` — `ExerciseViewer`
- Implement `apiClient.ts` (typed fetch wrapper for all 16 endpoints; throws `ApiError` on non-2xx)
- Implement `useAuthStore` and `useContentStore` Zustand stores
- Implement page components: `AuthPage`, `OAuthCallback`, `AppLayout`, `Dashboard`, `UnitBrowser`, `ExerciseBrowser`, `ExerciseViewer`
- Wire `TimerWidget`, `StatusSelector`, `NotesEditor`, `GlobalScratchPad` into `ExerciseViewer` and `AppLayout`
- Apply responsive layout (desktop and tablet, min 768px)
- Keyboard navigation support

**Key deliverables**:
```
frontend/src/
├── main.tsx
├── App.tsx                     (router setup)
├── api/apiClient.ts
├── stores/
│   ├── auth.store.ts
│   └── content.store.ts
└── pages/
    ├── AuthPage.tsx
    ├── OAuthCallback.tsx
    ├── Dashboard.tsx
    ├── UnitBrowser.tsx
    ├── ExerciseBrowser.tsx
    └── ExerciseViewer.tsx
```

**Exit criteria**: Complete user journey works end-to-end — sign in with GitHub → dashboard → browse units → open exercise → read tabbed content → start timer → set status → write notes → global scratch pad → sign out → redirect to auth page.
