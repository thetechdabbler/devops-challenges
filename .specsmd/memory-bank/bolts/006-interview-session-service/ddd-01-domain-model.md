---
stage: model
bolt: 006-interview-session-service
created: 2026-03-06T04:56:24Z
---

## Static Model: Interview Session Service - Rating, History, Review

### Entities

- **InterviewSession**: `id`, `user_id`, `topics[]`, `difficulty`, `experience_level`, `question_count`, `status`, `created_at`, `completed_at`.
  - Business Rules: history and review are user-scoped only; session order for history is newest-first; in-progress sessions can still be reviewed.
- **InterviewSessionQuestion**: `session_id`, `question_id`, `sequence_order`, `answer_revealed`, `revealed_at`, `self_rating`.
  - Business Rules: `self_rating` is nullable until user submits rating; rating allowed only after `answer_revealed=true`; re-rating replaces previous value (last-write-wins).
- **Question (review projection)**: `id`, `text`, `type`, `topics[]`, `answer`, `explanation`, `key_concepts`.
  - Business Rules: review mode always includes answer/explanation regardless of in-session reveal state.

### Value Objects

- **SelfRating**: `{ value: 1|2|3|4|5 }`
  - Constraints: value must be integer 1..5.
- **SessionHistoryCursor**: `{ createdAt: Date, id: string }`
  - Constraints: stable descending pagination key (created_at desc, id tie-breaker).
- **SessionHistoryItem**: `{ id, createdAt, topics, difficulty, experienceLevel, questionCount, status, avgSelfRating|null }`
  - Constraints: `avgSelfRating` is average of non-null ratings only.
- **SessionReviewView**: `{ session, questions[] }`
  - Constraints: questions sorted by `sequence_order` ascending.

### Aggregates

- **InterviewSession Aggregate**
  - Members: InterviewSession (root), InterviewSessionQuestion (children)
  - Invariants:
    - Rating write requires session ownership (`session.user_id == requester`).
    - Rating write requires question membership in session.
    - Rating write requires revealed answer (`answer_revealed=true`).
    - Question order is immutable once session is created.

### Domain Events

- **SelfRatingSubmitted**: Trigger: successful rate request.
  - Payload: `{ sessionId, questionId, userId, rating, ratedAt }`
- **SessionHistoryFetched**: Trigger: successful history query.
  - Payload: `{ userId, limit, cursorPresent, resultCount, hasMore }`
- **SessionReviewFetched**: Trigger: successful review query.
  - Payload: `{ sessionId, userId, questionCount }`

### Domain Services

- **SessionRatingService**: validates preconditions and persists `self_rating`.
  - Operations: `submitRating(sessionId, questionId, userId, rating)`
  - Dependencies: session repository (ownership/membership/reveal checks)
- **SessionHistoryService**: produces paginated user-scoped history with summary fields.
  - Operations: `listSessions(userId, cursor, limit)`
  - Dependencies: session repository + rating aggregation query
- **SessionReviewService**: returns full session review payload.
  - Operations: `getSessionDetail(sessionId, userId)`
  - Dependencies: session repository + question join query

### Repository Interfaces

- **InterviewSessionRepository**
  - `findById(sessionId) -> Session | null`
  - `findSessionQuestion(sessionId, questionId) -> SessionQuestion | null`
  - `updateSelfRating(sessionId, questionId, rating) -> SessionQuestion`
  - `listByUser(userId, cursor, limit) -> { items: SessionHistoryItem[], nextCursor, hasMore }`
  - `getSessionDetail(sessionId) -> SessionReviewView | null`
  - `computeAverageSelfRating(sessionId) -> number | null` (or materialized in list query)

### Ubiquitous Language

- **Self-rating**: user-scored 1-5 assessment for a revealed question.
- **Last-write-wins rating**: later rating updates replace earlier rating.
- **History list**: paginated, user-owned session summaries in descending creation order.
- **Review mode**: full session detail view that always exposes correct answers/explanations.
- **Cursor pagination**: pagination using continuation token rather than page index.
