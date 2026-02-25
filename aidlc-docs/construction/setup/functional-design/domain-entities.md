# Domain Entities — Unit 1: setup

---

## Enum: ProgressStatus

```prisma
enum ProgressStatus {
  NotStarted
  InProgress
  Completed
}
```

Default value: `NotStarted`

Maps to TypeScript enum on the frontend with identical names — no translation layer needed.

---

## Entity: User

Represents a GitHub-authenticated user account. Created on first login, updated on subsequent logins.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Internal user ID |
| github_id | Int | Unique, NOT NULL | GitHub numeric user ID (from OAuth profile) |
| username | String | NOT NULL | GitHub username (login handle) |
| avatar_url | String | NOT NULL | GitHub avatar URL |
| created_at | DateTime | NOT NULL, default `now()` | Account creation timestamp |

**Unique constraint**: `github_id` — one DB user per GitHub account.

**No password field** — authentication is GitHub OAuth only.

---

## Entity: ExerciseProgress

Tracks one user's completion status for one exercise. One record per `(user_id, unit, exercise)` combination — upserted on status change.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Internal record ID |
| user_id | Int | FK → User.id, NOT NULL | Owner user |
| unit | String | NOT NULL | Unit slug (e.g., `"docker"`) |
| exercise | String | NOT NULL | Exercise slug (e.g., `"01-build-your-first-container"`) |
| status | ProgressStatus | NOT NULL, default `NotStarted` | Current completion status |
| updated_at | DateTime | NOT NULL, `@updatedAt` | Timestamp of last status change |

**Unique constraint**: `(user_id, unit, exercise)` — one progress record per user per exercise.

**Implicit records**: Records are not pre-created for all 80 exercises. A record is created on first status update (upsert). Exercises without a record are treated as `NotStarted` by the application.

---

## Entity: Session

Tracks one timed practice attempt for one exercise. Multiple sessions per exercise are expected (one per practice attempt). Accumulates into total time spent.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Internal session ID |
| user_id | Int | FK → User.id, NOT NULL | Owner user |
| unit | String | NOT NULL | Unit slug |
| exercise | String | NOT NULL | Exercise slug |
| started_at | DateTime | NOT NULL, default `now()` | Session start time |
| ended_at | DateTime | Nullable | Session end time. `null` = active or orphaned. |
| duration_seconds | Int | Nullable | Computed on `end()`: `ended_at - started_at` in seconds. `null` if orphaned. |
| is_active | Boolean | NOT NULL, default `true` | `true` only for the current running session. |

**No unique constraint** on `(user_id, unit, exercise)` — multiple sessions per exercise are expected.

**Active session semantics**: At most one session per `(user_id, unit, exercise)` should have `is_active = true`. Enforced by application logic in `SessionService`, not a DB-level constraint (to support the orphaning behaviour where the previous session's `is_active` is set to `false` without computing duration).

**Orphaned session**: A session where `is_active = false` AND `ended_at = null` AND `duration_seconds = null`. Occurs when a new session starts while one is already active. Orphaned sessions are excluded from time totals (only sessions with non-null `duration_seconds` are summed).

---

## Entity: Note

Stores a user's markdown notes. One table serves both per-exercise notes and the global scratch pad, distinguished by null fields.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Internal note ID |
| user_id | Int | FK → User.id, NOT NULL | Owner user |
| unit | String | Nullable | Unit slug. `null` for global scratch pad. |
| exercise | String | Nullable | Exercise slug. `null` for global scratch pad. |
| content | String | NOT NULL, default `""` | Markdown note content |
| updated_at | DateTime | NOT NULL, `@updatedAt` | Last save timestamp |

**Unique constraint**: `(user_id, unit, exercise)` — one note per user per (exercise or global). The unique index must accommodate nulls (`null` values are treated as equal in this context — enforced by Prisma's `@@unique` on nullable fields with a filter index in PostgreSQL).

**Global scratch pad sentinel**: `unit = null AND exercise = null` → global note. The two fields are always both null or both non-null — application enforces this rule; no mixed state allowed.

---

## Entity Relationships

```
User 1 ──────────── * ExerciseProgress
User 1 ──────────── * Session
User 1 ──────────── * Note
```

All user-owned entities cascade on `User` delete: deleting a user removes all their `ExerciseProgress`, `Session`, and `Note` records.

No cross-entity foreign keys other than `user_id` — entities are independent of each other (e.g., a Note does not reference an ExerciseProgress record).
