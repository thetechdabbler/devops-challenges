# Requirements Document — DevOps Practice Portal

## Intent Analysis

| Field | Value |
|-------|-------|
| **User Request** | Create a portal where users can go through practice projects one by one, track progress, and take notes |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Full-stack web application — frontend SPA + REST API + PostgreSQL + auth |
| **Complexity Estimate** | Moderate — standard CRUD + GitHub OAuth + markdown rendering + timer logic |

---

## Confirmed Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite (SPA) |
| Backend | Node.js + Express (REST API) |
| Database | PostgreSQL |
| Authentication | GitHub OAuth via Passport.js + JWT (httpOnly cookies) |
| Content Source | `devops-challenges/` directory — served via backend API at runtime |
| Deployment | Self-hosted VPS, Dockerised via Docker Compose |

---

## Functional Requirements

### FR-01 — Exercise Browsing
- User can view all 8 units (docker, kubernetes, ci, cd, ansible, iac, observability, aws)
- Each unit shows all 10 exercises with their status (Not Started / In Progress / Completed) and total time spent
- Exercises are presented in numbered order (01–10) for guided progression

### FR-02 — Exercise Content Viewer
- User can open any exercise and read its content rendered as markdown:
  - `README.md` — quick overview tab
  - `challenge.md` — full challenge with bugs and acceptance criteria
  - `resources.md` — curated links and reference commands
- Content is fetched from the backend API which reads `devops-challenges/` at runtime
- Previous / Next navigation buttons allow sequential movement through exercises

### FR-03 — Progress Tracking
- Per-exercise status: **Not Started** (default) → **In Progress** → **Completed**
- User can manually set status via a button or dropdown on the exercise page
- Status persists per user in PostgreSQL

### FR-04 — Timed Sessions
- User can start a timer when beginning an exercise (Start Session button)
- User can stop the timer when pausing or finishing (Stop Session button)
- Total time spent is accumulated across multiple sessions per exercise
- Active session survives page refresh (timer state stored in DB, not just frontend)
- Time displayed as HH:MM:SS on the exercise page

### FR-05 — Notes per Exercise
- Each exercise has a private notes area for the logged-in user
- Notes support markdown input with live rendered preview (split-pane or toggle)
- Notes auto-save on a short debounce (e.g. 1 second after last keystroke)
- Notes persist per user per exercise in PostgreSQL

### FR-06 — Global Scratch Pad
- A persistent global notes area accessible from the sidebar/nav on all pages
- Not tied to any specific exercise — for general commands, reminders, or planning
- Same markdown + auto-save behaviour as per-exercise notes
- Persists per user in PostgreSQL

### FR-07 — Authentication (GitHub OAuth)
- Users sign in exclusively via GitHub OAuth
- No email/password accounts
- On first login, a user record is created from the GitHub profile (username, avatar)
- Sessions managed via JWT stored in httpOnly cookies (not localStorage)
- Protected routes redirect to login if unauthenticated

### FR-08 — Progress Dashboard (Home Page)
- Displays overall progress summary after login:
  - Total exercises completed out of 80
  - Per-unit progress bar (N / 10 exercises completed)
  - Total time spent across all exercises
  - List of recently accessed exercises (last 5)

---

## Non-Functional Requirements

### NFR-01 — Performance
- Markdown content cached in memory on first load per exercise (no disk read per request)
- API response time under 300ms for progress/notes endpoints
- React SPA lazy-loads exercise content on navigation

### NFR-02 — Security
- GitHub OAuth only — no plain-text passwords stored
- JWT stored in httpOnly, SameSite=Strict cookies to prevent XSS and CSRF
- All `/api/*` routes protected by auth middleware
- CORS restricted to the configured frontend origin
- Content API is read-only — users cannot write to `devops-challenges/` files

### NFR-03 — Usability
- Responsive layout usable on desktop and tablet (min 768px)
- Keyboard navigable throughout (Tab, Enter, Arrow keys)
- Clear visual indicators for exercise status (colour coding + icons)

### NFR-04 — Reliability
- PostgreSQL connection pooling with retry on startup
- Graceful 404 for missing exercise files (no server crash)
- Timer continues in DB if frontend disconnects mid-session

### NFR-05 — Deployment
- Entire stack runs via `docker-compose up` (app + postgres containers)
- All secrets and config via `.env` file (never committed)
- Health check endpoint at `GET /health`

---

## Data Model

| Table | Key Columns |
|-------|------------|
| `users` | id, github_id, username, avatar_url, created_at |
| `exercise_progress` | id, user_id, unit, exercise, status (enum), updated_at |
| `sessions` | id, user_id, unit, exercise, started_at, ended_at, duration_seconds, is_active |
| `notes` | id, user_id, unit (nullable), exercise (nullable), content, updated_at |

Notes with `unit = NULL` and `exercise = NULL` represent the global scratch pad.

---

## API Surface

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/health` | No | Health check |
| GET | `/auth/github` | No | Initiate GitHub OAuth |
| GET | `/auth/github/callback` | No | OAuth callback — set JWT cookie |
| POST | `/api/auth/logout` | Yes | Clear JWT cookie |
| GET | `/api/me` | Yes | Current user profile |
| GET | `/api/content/units` | Yes | List all units + exercises (metadata only) |
| GET | `/api/content/:unit/:exercise/:file` | Yes | Get rendered markdown content |
| GET | `/api/progress` | Yes | All exercise progress for current user |
| PUT | `/api/progress/:unit/:exercise` | Yes | Set exercise status |
| POST | `/api/sessions/start` | Yes | Start a timed session |
| POST | `/api/sessions/end` | Yes | End the active session |
| GET | `/api/sessions/:unit/:exercise` | Yes | Get all sessions for an exercise |
| GET | `/api/notes/:unit/:exercise` | Yes | Get note for an exercise |
| PUT | `/api/notes/:unit/:exercise` | Yes | Save note for an exercise |
| GET | `/api/notes/global` | Yes | Get global scratch pad |
| PUT | `/api/notes/global` | Yes | Save global scratch pad |

---

## Out of Scope (Initial Version)

- Exercise submission or automated grading
- Leaderboards or social features
- Email notifications
- Mobile app
- Admin panel
- CI/CD pipeline for the portal itself (manual deploy to VPS)

---

## Success Criteria

- User can sign in with GitHub and see their personalised dashboard
- User can navigate all 80 exercises and read challenge, README, and resources content
- Progress status and timed sessions update correctly and persist across devices
- Per-exercise and global notes save and load correctly
- Application starts with `docker-compose up` on a fresh VPS
