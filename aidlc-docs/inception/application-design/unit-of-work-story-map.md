# Unit of Work — Story Map
# DevOps Practice Portal

> Note: User Stories stage was skipped (single persona, requirements clear).
> This map uses Functional Requirements (FR-01–FR-08) and Non-Functional Requirements
> (NFR-01–NFR-05) from `portal-requirements.md` as the equivalent of stories.

---

## Requirements Coverage Matrix

| Requirement | Unit 1 setup | Unit 2 auth | Unit 3 content-api | Unit 4 progress | Unit 5 notes | Unit 6 frontend-shell |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|
| FR-01 Exercise Browsing | | | ✓ API | | | ✓ UI |
| FR-02 Content Viewer | | | ✓ API | | | ✓ UI |
| FR-03 Progress Tracking | | | | ✓ API+UI | | ✓ wire |
| FR-04 Timed Sessions | | | | ✓ API+UI | | ✓ wire |
| FR-05 Notes per Exercise | | | | | ✓ API+UI | ✓ wire |
| FR-06 Global Scratch Pad | | | | | ✓ API+UI | ✓ wire |
| FR-07 Authentication | ✓ schema | ✓ API | | | | ✓ UI |
| FR-08 Progress Dashboard | | | ✓ units data | ✓ progress data | | ✓ UI |
| NFR-01 Performance | | | ✓ cache | | | ✓ lazy load |
| NFR-02 Security | ✓ env/secrets | ✓ JWT/OAuth/CORS | ✓ read-only | | | |
| NFR-03 Usability | | | | | | ✓ responsive |
| NFR-04 Reliability | ✓ DB pool | | ✓ graceful 404 | ✓ session in DB | | |
| NFR-05 Deployment | ✓ Docker Compose | | | | | |

---

## Per-Unit Requirement Detail

### Unit 1: setup

| Requirement | Deliverable |
|-------------|------------|
| FR-07 — Auth (schema) | `users` table: `id`, `github_id`, `username`, `avatar_url`, `created_at` |
| FR-03 — Progress (schema) | `exercise_progress` table: `id`, `user_id`, `unit`, `exercise`, `status` (enum), `updated_at` |
| FR-04 — Sessions (schema) | `sessions` table: `id`, `user_id`, `unit`, `exercise`, `started_at`, `ended_at`, `duration_seconds` |
| FR-05/06 — Notes (schema) | `notes` table: `id`, `user_id`, `unit` (nullable), `exercise` (nullable), `content`, `updated_at` |
| NFR-02 — Security | `.env.example` defines all secrets; `.gitignore` excludes `.env` |
| NFR-04 — Reliability | Prisma connection pooling configured; server waits for DB on startup |
| NFR-05 — Deployment | `docker-compose.yml` with `backend`, `frontend` (nginx), `postgres` services; `GET /health` returns 200 |

---

### Unit 2: auth

| Requirement | Deliverable |
|-------------|------------|
| FR-07 — Authentication | GitHub OAuth via Passport.js; JWT signed with `JWT_SECRET`; httpOnly cookie set on successful login; user upserted from GitHub profile on first login |
| NFR-02 — Security | JWT in `httpOnly; SameSite=Strict` cookie (not localStorage); CORS restricted to `FRONTEND_URL`; `AuthMiddleware` applied to all `/api/*` routes; 401 on invalid or missing token |

---

### Unit 3: content-api

| Requirement | Deliverable |
|-------------|------------|
| FR-01 — Exercise Browsing | `GET /api/content/units` — returns `UnitMeta[]` with all 8 units and their 10 exercises each |
| FR-02 — Content Viewer | `GET /api/content/:unit/:exercise/:file` — returns `{ content: string }` (raw markdown) |
| FR-08 — Dashboard (units) | Units index provides the unit/exercise structure for Dashboard progress bars |
| NFR-01 — Performance | `ContentService` caches file content per `(unit, exercise, file)` key after first read; units index built once at startup |
| NFR-02 — Security | `ContentService` is read-only — no write path exists to `devops-challenges/` |
| NFR-04 — Reliability | `NotFoundError` thrown for missing files → `ErrorMiddleware` maps to 404 JSON response; no server crash |

---

### Unit 4: progress

| Requirement | Deliverable |
|-------------|------------|
| FR-03 — Progress Tracking | `GET /api/progress` all user progress; `PUT /api/progress/:unit/:exercise` status upsert; `StatusSelector` component with Not Started / In Progress / Completed |
| FR-04 — Timed Sessions | `POST /api/sessions/start` creates active session; `POST /api/sessions/end` computes `duration_seconds`; `GET /api/sessions/:unit/:exercise` returns sessions + `totalSeconds`; `TimerWidget` shows HH:MM:SS, resumes active session on mount |
| FR-08 — Dashboard (progress) | `useProgressStore` data consumed by Dashboard to display totals and per-unit progress |
| NFR-04 — Reliability | Active session stored in DB — timer continues if browser closes; `endActive()` computes duration on the server side |

---

### Unit 5: notes

| Requirement | Deliverable |
|-------------|------------|
| FR-05 — Notes per Exercise | `GET /api/notes/:unit/:exercise` and `PUT /api/notes/:unit/:exercise`; `NotesEditor` with CodeMirror, preview toggle, and 1-second debounce auto-save |
| FR-06 — Global Scratch Pad | `GET /api/notes/global` and `PUT /api/notes/global` (`unit = null`, `exercise = null` in DB); `GlobalScratchPad` component accessible from `AppLayout` sidebar on all pages |

---

### Unit 6: frontend-shell

| Requirement | Deliverable |
|-------------|------------|
| FR-01 — Exercise Browsing | `UnitBrowser` page (unit cards with progress summary); `ExerciseBrowser` page (exercise list with status badge and time spent) |
| FR-02 — Content Viewer | `ExerciseViewer` page with tabbed content (README / Challenge / Resources), rendered via `react-markdown`, prev/next navigation |
| FR-03 — Progress Tracking | `StatusSelector` wired into `ExerciseViewer`; status badges in `ExerciseBrowser` |
| FR-04 — Timed Sessions | `TimerWidget` wired into `ExerciseViewer`; time totals in `ExerciseBrowser` |
| FR-05 — Notes | `NotesEditor` wired into `ExerciseViewer` |
| FR-06 — Global Scratch Pad | `GlobalScratchPad` in `AppLayout` sidebar — accessible from every page |
| FR-07 — Authentication | `AuthPage` (sign in with GitHub button); `OAuthCallback` (hydrates auth store after OAuth redirect); protected routes redirect unauthenticated users to `/` |
| FR-08 — Progress Dashboard | `Dashboard` page — total exercises completed (N/80), per-unit progress bars (N/10), total time spent, last 5 accessed exercises |
| NFR-01 — Performance | `useContentStore` loads exercise markdown lazily on navigation (not all upfront) |
| NFR-03 — Usability | Responsive CSS layout (desktop + tablet min 768px); keyboard navigable (Tab, Enter, Arrow key support) |

---

## Coverage Verification

All requirements are covered — no gaps.

| ID | Requirement | Primary Unit | Supporting Units |
|----|-------------|-------------|-----------------|
| FR-01 | Exercise Browsing | 3 | 6 |
| FR-02 | Content Viewer | 3 | 6 |
| FR-03 | Progress Tracking | 4 | 6 |
| FR-04 | Timed Sessions | 4 | 6 |
| FR-05 | Notes per Exercise | 5 | 6 |
| FR-06 | Global Scratch Pad | 5 | 6 |
| FR-07 | Authentication | 2 | 1, 6 |
| FR-08 | Progress Dashboard | 6 | 3, 4 |
| NFR-01 | Performance | 3 | 6 |
| NFR-02 | Security | 2 | 1, 3 |
| NFR-03 | Usability | 6 | — |
| NFR-04 | Reliability | 1 | 3, 4 |
| NFR-05 | Deployment | 1 | — |
