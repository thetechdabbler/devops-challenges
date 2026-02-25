# Component Dependencies — DevOps Practice Portal

---

## Dependency Matrix

| Component | Depends On |
|-----------|-----------|
| AuthController | AuthService, Passport.js |
| ContentController | ContentService |
| ProgressController | ProgressService |
| SessionsController | SessionService |
| NotesController | NoteService |
| AuthService | UserRepository, jsonwebtoken |
| ContentService | fs/promises (Node stdlib), devops-challenges/ filesystem |
| SessionService | SessionRepository |
| ProgressService | ProgressRepository |
| NoteService | NoteRepository |
| UserRepository | Prisma Client |
| ProgressRepository | Prisma Client |
| SessionRepository | Prisma Client |
| NoteRepository | Prisma Client |
| AuthMiddleware | AuthService |
| ErrorMiddleware | (none — terminal handler) |
| Dashboard | useProgressStore, useContentStore |
| UnitBrowser | useContentStore, useProgressStore |
| ExerciseBrowser | useContentStore, useProgressStore |
| ExerciseViewer | useContentStore, TimerWidget, StatusSelector, NotesEditor |
| TimerWidget | useProgressStore (sessions) |
| StatusSelector | useProgressStore |
| NotesEditor | useNotesStore, CodeMirror, react-markdown |
| GlobalScratchPad | NotesEditor, useNotesStore |
| AppLayout | useAuthStore, GlobalScratchPad |
| All stores | apiClient |
| apiClient | fetch (browser), backend REST API |

---

## Data Flow — Exercise Page

```
User opens ExerciseViewer
         |
         v
useContentStore.loadFile()
         |
         v
apiClient.content.getFile(unit, exercise, "challenge.md")
         |
         v
GET /api/content/:unit/:exercise/challenge.md
         |
         v
ContentController --> ContentService (cache hit or filesystem read)
         |
         v
Returns markdown string --> react-markdown renders in browser
```

---

## Data Flow — Timer

```
User clicks "Start Session"
         |
         v
TimerWidget --> useProgressStore.startSession(unit, exercise)
         |
         v
apiClient.sessions.start(unit, exercise)
         |
         v
POST /api/sessions/start
         |
         v
SessionsController --> SessionService.start()
         |
         v
SessionRepository.create() --> PostgreSQL sessions table
         |
         v
Local interval in TimerWidget counts elapsed seconds
         |
         v
User clicks "Stop Session"
         |
         v
useProgressStore.endSession()
         |
         v
POST /api/sessions/end --> SessionService.end()
         |
         v
SessionRepository.endActive() computes duration_seconds
```

---

## Data Flow — Notes Auto-Save

```
User types in NotesEditor (CodeMirror)
         |
         v
onChange fires
         |
         v
1-second debounce timer resets
         |
         v
(after 1 second of no typing)
         |
         v
useNotesStore.saveNote(unit, exercise, content)
         |
         v
apiClient.notes.save(unit, exercise, content)
         |
         v
PUT /api/notes/:unit/:exercise
         |
         v
NotesController --> NoteService.upsert()
         |
         v
NoteRepository.upsert() --> PostgreSQL notes table
```

---

## Authentication Flow

```
User visits any /api/* route (unauthenticated)
         |
         v
AuthMiddleware: no cookie or invalid JWT
         |
         v
401 Unauthorized --> apiClient throws ApiError
         |
         v
useAuthStore detects 401 --> clears user state
         |
         v
AppLayout redirects to AuthPage (/)
         |
         v
User clicks "Sign in with GitHub"
         |
         v
Browser navigates to GET /auth/github
         |
         v
Passport.js redirects to GitHub authorisation
         |
         v
GitHub redirects to GET /auth/github/callback
         |
         v
AuthController.handleOAuthCallback()
  --> AuthService.upsertUser(githubProfile)
  --> AuthService.generateJWT(userId)
  --> Set httpOnly cookie
  --> Redirect to frontend /auth/callback
         |
         v
OAuthCallback component
  --> useAuthStore.hydrate() (GET /api/me)
  --> Redirect to /dashboard
```

---

## Key Boundaries

| Boundary | Rule |
|----------|------|
| Frontend / Backend | All communication via REST API over HTTP — no shared code at runtime |
| Backend / Filesystem | Only ContentService reads devops-challenges/ — no other component touches filesystem |
| Backend / Database | Only Repository classes use Prisma Client — Services never import Prisma directly |
| Auth | All /api/* routes go through AuthMiddleware — no exceptions |
| Notes global vs per-exercise | Distinguished by unit/exercise being null vs set — same table, same service |
