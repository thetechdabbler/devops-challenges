# Components — DevOps Practice Portal

## Language
TypeScript throughout (frontend and backend). Implied by Prisma ORM choice.

---

## Backend Components

### AuthController
**Purpose**: Handles GitHub OAuth flow and session management
**Responsibilities**:
- Initiate GitHub OAuth redirect
- Process OAuth callback, upsert user, issue JWT cookie
- Handle logout by clearing JWT cookie

### ContentController
**Purpose**: Serves exercise content from the devops-challenges/ filesystem
**Responsibilities**:
- Return the index of all units and exercises (metadata only)
- Return rendered markdown for a specific unit/exercise/file
- Delegates caching to ContentService

### ProgressController
**Purpose**: CRUD for per-user exercise progress status
**Responsibilities**:
- Return all exercise progress for the authenticated user
- Update status (Not Started / In Progress / Completed) for a single exercise

### SessionsController
**Purpose**: Manages timed practice sessions per exercise
**Responsibilities**:
- Start a new session (creates active session record)
- End the current active session (computes and stores duration)
- Return all sessions for a specific exercise

### NotesController
**Purpose**: CRUD for per-exercise notes and global scratch pad
**Responsibilities**:
- Return note content for a specific exercise or global scratch pad
- Upsert (create or update) note content

### AuthMiddleware
**Purpose**: Protects all /api/* routes
**Responsibilities**:
- Extract JWT from httpOnly cookie
- Verify and decode JWT
- Attach user to request context
- Reject unauthenticated requests with 401

### ErrorMiddleware
**Purpose**: Centralised error handling
**Responsibilities**:
- Catch unhandled errors from all routes
- Return consistent JSON error responses
- Log errors server-side

---

## Backend Services

### ContentService
**Purpose**: Filesystem reader and in-memory cache for exercise content
**Responsibilities**:
- Scan devops-challenges/ on startup to build units index
- Read and cache markdown file content per unit/exercise/file
- Provide the units index tree to controllers

### AuthService
**Purpose**: User identity and token management
**Responsibilities**:
- Upsert user record from GitHub profile data
- Generate signed JWT containing user ID
- Verify and decode JWT

### SessionService
**Purpose**: Timer business logic
**Responsibilities**:
- Create a new active session, orphaning any existing active session
- End the active session by computing duration and persisting it
- Aggregate total time across all sessions for an exercise

### ProgressService
**Purpose**: Thin orchestration layer over ProgressRepository
**Responsibilities**:
- Fetch all progress records for a user
- Upsert a progress record

### NoteService
**Purpose**: Thin orchestration layer over NoteRepository
**Responsibilities**:
- Fetch note by user + exercise (or global)
- Upsert note content

---

## Backend Repositories

### UserRepository
**Purpose**: Database access for users table
**Responsibilities**: findByGithubId, upsert

### ProgressRepository
**Purpose**: Database access for exercise_progress table
**Responsibilities**: findAllByUser, upsert (unit + exercise + status)

### SessionRepository
**Purpose**: Database access for sessions table
**Responsibilities**: create, endActive (find and close active session), findByExercise

### NoteRepository
**Purpose**: Database access for notes table
**Responsibilities**: findByExercise (nullable unit/exercise for global), upsert

---

## Frontend Components

### AuthPage
**Purpose**: Unauthenticated landing page
**Responsibilities**:
- Display sign-in prompt and GitHub OAuth button
- Redirect authenticated users to Dashboard

### OAuthCallback
**Purpose**: Handles the GitHub OAuth redirect back to the app
**Responsibilities**:
- Trigger auth store hydration after successful login
- Redirect to Dashboard on success, AuthPage on failure

### AppLayout
**Purpose**: Persistent shell wrapping all authenticated pages
**Responsibilities**:
- Render top navigation bar (logo, user avatar, logout)
- Render sidebar (unit list, global scratch pad access)
- Render main content area (router outlet)

### Dashboard
**Purpose**: Home page showing overall learning progress
**Responsibilities**:
- Display total exercises completed (N / 80)
- Display per-unit progress bars (N / 10)
- Display total time spent
- Display recently accessed exercises

### UnitBrowser
**Purpose**: Lists all units for the current user
**Responsibilities**:
- Render unit cards with progress summary
- Navigate to ExerciseBrowser on click

### ExerciseBrowser
**Purpose**: Lists all 10 exercises within a unit
**Responsibilities**:
- Render exercise rows with status badge and time spent
- Navigate to ExerciseViewer on click

### ExerciseViewer
**Purpose**: Main exercise reading and interaction page
**Responsibilities**:
- Render tabbed content: README / Challenge / Resources
- Render markdown using react-markdown
- Host TimerWidget, StatusSelector, and NotesEditor
- Previous/Next exercise navigation buttons

### TimerWidget
**Purpose**: Controls and displays the practice session timer
**Responsibilities**:
- Show current elapsed time (HH:MM:SS) for the active session
- Start Session / Stop Session buttons
- Resume automatically if an active session exists on mount

### StatusSelector
**Purpose**: Allows user to set the status of the current exercise
**Responsibilities**:
- Display current status with colour coding
- Allow selection: Not Started / In Progress / Completed
- Persist status change via API on selection

### NotesEditor
**Purpose**: Markdown note editor with rich editing and preview
**Responsibilities**:
- Render CodeMirror editor for markdown input
- Render live preview of the rendered markdown (toggle or split pane)
- Auto-save note to API on debounce (1 second after last keystroke)
- Used for both per-exercise notes and global scratch pad (passed via props)

### GlobalScratchPad
**Purpose**: Wrapper around NotesEditor for the global note
**Responsibilities**:
- Load and save the global scratch pad note
- Accessible from the AppLayout sidebar on all pages
