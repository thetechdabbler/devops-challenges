# Component Methods — DevOps Practice Portal

Note: Detailed business logic is defined in Functional Design (Construction phase).
This document covers method signatures, inputs, outputs, and high-level purpose only.

---

## Backend Controllers

### AuthController

```typescript
initiateGitHubOAuth(req: Request, res: Response): void
// Redirects browser to GitHub OAuth authorisation URL via Passport.js

handleOAuthCallback(req: Request, res: Response): Promise<void>
// Input:  GitHub OAuth code (via Passport.js, from query params)
// Output: Sets JWT httpOnly cookie, redirects to frontend /auth/callback
// Calls:  AuthService.upsertUser(), AuthService.generateJWT()

logout(req: Request, res: Response): void
// Clears the JWT httpOnly cookie and returns 200
```

### ContentController

```typescript
listUnits(req: AuthRequest, res: Response): Promise<void>
// Output: JSON array of units with exercise metadata (name, slug, file list)
// Calls:  ContentService.getUnitsIndex()

getFile(req: AuthRequest, res: Response): Promise<void>
// Input:  req.params { unit, exercise, file }
// Output: JSON { content: string } — rendered markdown string
// Calls:  ContentService.getFileContent(unit, exercise, file)
```

### ProgressController

```typescript
getAllProgress(req: AuthRequest, res: Response): Promise<void>
// Output: JSON array of all ExerciseProgress records for req.user.id
// Calls:  ProgressService.getAllForUser(userId)

updateProgress(req: AuthRequest, res: Response): Promise<void>
// Input:  req.params { unit, exercise }, req.body { status }
// Output: JSON updated ExerciseProgress record
// Calls:  ProgressService.upsert(userId, unit, exercise, status)
```

### SessionsController

```typescript
startSession(req: AuthRequest, res: Response): Promise<void>
// Input:  req.body { unit, exercise }
// Output: JSON new Session record
// Calls:  SessionService.start(userId, unit, exercise)

endSession(req: AuthRequest, res: Response): Promise<void>
// Input:  req.body { unit, exercise }
// Output: JSON ended Session record with duration_seconds
// Calls:  SessionService.end(userId, unit, exercise)

getExerciseSessions(req: AuthRequest, res: Response): Promise<void>
// Input:  req.params { unit, exercise }
// Output: JSON array of Session records + totalSeconds: number
// Calls:  SessionService.getForExercise(userId, unit, exercise)
```

### NotesController

```typescript
getNote(req: AuthRequest, res: Response): Promise<void>
// Input:  req.params { unit?, exercise? } (omitted for global)
// Output: JSON { content: string, updatedAt: string }
// Calls:  NoteService.get(userId, unit?, exercise?)

saveNote(req: AuthRequest, res: Response): Promise<void>
// Input:  req.params { unit?, exercise? }, req.body { content: string }
// Output: JSON updated Note record
// Calls:  NoteService.upsert(userId, unit?, exercise?, content)
```

---

## Backend Services

### ContentService

```typescript
initialize(): Promise<void>
// Scans devops-challenges/ directory and builds in-memory units index
// Called once at server startup

getUnitsIndex(): UnitMeta[]
// Returns cached array of { unit, exercises: ExerciseMeta[] }

getFileContent(unit: string, exercise: string, file: string): Promise<string>
// Returns markdown string; reads from cache or filesystem on first access
// Throws NotFoundError if file does not exist
```

### AuthService

```typescript
upsertUser(profile: GitHubProfile): Promise<User>
// Creates user on first login, updates avatar/username on subsequent logins

generateJWT(userId: number): string
// Returns signed JWT string (expires in 7 days)

verifyJWT(token: string): JWTPayload
// Returns decoded payload or throws on invalid/expired token
```

### SessionService

```typescript
start(userId: number, unit: string, exercise: string): Promise<Session>
// Creates new session; marks any existing active session as orphaned

end(userId: number, unit: string, exercise: string): Promise<Session>
// Finds active session, sets ended_at, computes duration_seconds

getForExercise(userId: number, unit: string, exercise: string): Promise<SessionSummary>
// Returns { sessions: Session[], totalSeconds: number }
```

### ProgressService

```typescript
getAllForUser(userId: number): Promise<ExerciseProgress[]>
// Returns all progress records for user

upsert(userId: number, unit: string, exercise: string, status: ProgressStatus): Promise<ExerciseProgress>
// Creates or updates progress record
```

### NoteService

```typescript
get(userId: number, unit?: string, exercise?: string): Promise<Note | null>
// Returns note; unit/exercise null = global scratch pad

upsert(userId: number, unit?: string, exercise?: string, content: string): Promise<Note>
// Creates or updates note
```

---

## Frontend Components

### AuthPage

```typescript
AuthPage(): JSX.Element
// Renders sign-in UI; redirects to /dashboard if already authenticated
```

### AppLayout

```typescript
AppLayout({ children }: { children: ReactNode }): JSX.Element
// Renders nav + sidebar + main area; protects route (redirects to / if not authed)
```

### Dashboard

```typescript
Dashboard(): JSX.Element
// Reads from useProgressStore; renders overall stats and recent exercises
```

### UnitBrowser

```typescript
UnitBrowser(): JSX.Element
// Reads from useContentStore (units index) and useProgressStore
// Renders clickable unit cards with progress bar
```

### ExerciseBrowser

```typescript
ExerciseBrowser({ unit }: { unit: string }): JSX.Element
// Renders exercise list for a unit with status badges and time totals
```

### ExerciseViewer

```typescript
ExerciseViewer({ unit, exercise }: { unit: string, exercise: string }): JSX.Element
// Fetches content, hosts TimerWidget, StatusSelector, NotesEditor
// Renders tabbed markdown content + prev/next navigation
```

### TimerWidget

```typescript
TimerWidget({ unit: string, exercise: string }): JSX.Element
// Shows elapsed time; Start/Stop buttons call sessions API
// Polls or uses local interval to update displayed time
```

### StatusSelector

```typescript
StatusSelector({ unit: string, exercise: string }): JSX.Element
// Shows current status; onChange calls progress API and updates store
```

### NotesEditor

```typescript
NotesEditor({ unit?: string, exercise?: string }): JSX.Element
// unit/exercise undefined = global scratch pad mode
// Renders CodeMirror editor + rendered preview toggle
// Auto-saves on 1-second debounce via notes API
```

---

## Zustand Stores

### useAuthStore

```typescript
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  hydrate(): Promise<void>   // fetch /api/me on app load
  logout(): Promise<void>    // call /api/auth/logout, clear state
}
```

### useProgressStore

```typescript
interface ProgressStore {
  progress: Record<string, ExerciseProgress>  // key: "unit/exercise"
  sessions: Record<string, SessionSummary>    // key: "unit/exercise"
  load(): Promise<void>
  updateStatus(unit: string, exercise: string, status: ProgressStatus): Promise<void>
  startSession(unit: string, exercise: string): Promise<void>
  endSession(unit: string, exercise: string): Promise<void>
}
```

### useContentStore

```typescript
interface ContentStore {
  units: UnitMeta[]
  fileCache: Record<string, string>  // key: "unit/exercise/file"
  loadUnits(): Promise<void>
  loadFile(unit: string, exercise: string, file: string): Promise<string>
}
```

### useNotesStore

```typescript
interface NotesStore {
  notes: Record<string, string>  // key: "unit/exercise" or "global"
  getNote(unit?: string, exercise?: string): Promise<void>
  saveNote(unit?: string, exercise?: string, content: string): Promise<void>
}
```
