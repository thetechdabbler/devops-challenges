# Services — DevOps Practice Portal

---

## Service Layer Overview

```
+-----------------------------------------------+
|              Express Route Handlers            |
|  AuthController  ContentController  ...        |
+-----------------------------------------------+
          |                  |
          v                  v
+------------------+  +------------------+
|   AuthService    |  | ContentService   |
|  - upsertUser    |  |  - initialize    |
|  - generateJWT   |  |  - getUnitsIndex |
|  - verifyJWT     |  |  - getFileContent|
+------------------+  +------------------+
          |
          v
+------------------+  +------------------+  +------------------+
|  SessionService  |  | ProgressService  |  |   NoteService    |
|  - start         |  |  - getAllForUser  |  |  - get           |
|  - end           |  |  - upsert        |  |  - upsert        |
|  - getForExercise|  +------------------+  +------------------+
+------------------+
          |
          v
+------------------+  +------------------+  +------------------+  +------------------+
|  UserRepository  |  | ProgressRepository|  | SessionRepository|  |  NoteRepository  |
+------------------+  +------------------+  +------------------+  +------------------+
          |                  |                      |                      |
          +------------------+----------------------+----------------------+
                                      |
                                      v
                              +----------------+
                              |   PostgreSQL   |
                              |   (via Prisma) |
                              +----------------+
```

---

## Service Definitions

### ContentService

**Role**: Filesystem reader and in-memory cache. The only service that touches the devops-challenges/ directory.

**Interactions**:
- Called by ContentController
- Reads devops-challenges/ filesystem at startup
- No database interaction

**Caching strategy**:
- Units index built once on `initialize()` and held in memory
- File content cached on first read per (unit, exercise, file) key
- Cache lives for the lifetime of the server process (restart to pick up new content)

**Error handling**:
- Missing file → throws `NotFoundError` (mapped to 404 by ErrorMiddleware)
- Permission error → throws `InternalError` (mapped to 500)

---

### AuthService

**Role**: User identity lifecycle and JWT issuance.

**Interactions**:
- Called by AuthController (OAuth callback + logout)
- Called by AuthMiddleware (JWT verification on every protected request)
- Uses UserRepository

**OAuth flow orchestration**:
1. Passport.js executes GitHub strategy, yields GitHub profile
2. AuthService.upsertUser() → creates or updates user in DB
3. AuthService.generateJWT() → signs token with userId
4. Controller sets token as httpOnly cookie

---

### SessionService

**Role**: Timer business logic. The most stateful service.

**Interactions**:
- Called by SessionsController
- Uses SessionRepository

**Business rules** (detailed in Functional Design):
- Only one active session allowed per user per exercise at a time
- Starting a session while one is already active orphans the previous session (marks it with a `null` ended_at)
- Duration is computed as `ended_at - started_at` in seconds on `end()`
- `getForExercise()` sums only sessions with a non-null `duration_seconds`

---

### ProgressService

**Role**: Thin orchestration layer for exercise status.

**Interactions**:
- Called by ProgressController
- Uses ProgressRepository

**Notes**: No significant business logic. Status enum values enforced at DB level via Prisma schema.

---

### NoteService

**Role**: Thin orchestration layer for note persistence.

**Interactions**:
- Called by NotesController
- Uses NoteRepository

**Notes**: Global scratch pad distinguished by `unit = null` AND `exercise = null`. Per-exercise note has both set.

---

## Middleware

### AuthMiddleware

**Role**: JWT guard for all `/api/*` routes.

**Interaction sequence**:
```
Request
   |
   v
Extract JWT from httpOnly cookie
   |
   v
AuthService.verifyJWT(token)
   |
   +-- invalid/expired --> 401 Unauthorized
   |
   v
Attach user to req.user
   |
   v
next()
```

---

## Frontend Service Layer (API Client)

All API calls centralised in a typed `apiClient` module using `fetch`. Each Zustand store calls `apiClient` methods — UI components never call `fetch` directly.

```
+-------------------+
|  Zustand Stores   |
|  useAuthStore     |
|  useProgressStore |
|  useContentStore  |
|  useNotesStore    |
+-------------------+
          |
          v
+-------------------+
|    apiClient.ts   |
|  auth.*           |
|  content.*        |
|  progress.*       |
|  sessions.*       |
|  notes.*          |
+-------------------+
          |
          v
+-------------------+
|  Express REST API |
+-------------------+
```

**Error handling**: `apiClient` throws typed `ApiError` objects. Stores catch and expose `error` state. Components render error UI from store state.
