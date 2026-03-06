---
stage: model
bolt: 004-interview-session-service
created: 2026-03-06T00:00:00Z
---

## Static Model: Interview Session Service (Core)

### Entities

- **Session**: `id (uuid), user_id (int FK), topics (Topic[]), difficulty (1-5), experience_level (ExperienceLevel), question_count (int), status (in_progress|completed), created_at, completed_at?`
  — Business Rules: question_count between 5-20; user-scoped (user can only see own sessions); status transitions: in_progress → completed (one-way); completed_at set when last question is revealed

- **SessionQuestion**: `id (uuid), session_id (uuid FK), question_id (uuid FK), sequence_order (int), answer_revealed (bool default false), self_rating (1-5 | null), revealed_at?`
  — Business Rules: sequence_order is unique within a session (1..N); answer only revealed by explicit action (bolt 005); self_rating requires answer_revealed = true (bolt 006)

### Value Objects

- **SessionConfig**: `{ topics: Topic[], difficulty: 1-5, experience_level: ExperienceLevel, question_count: 5-20 }`
  — Immutable; validated at request boundary before session creation; topics must be non-empty array of valid Topic enum values

- **CurrentQuestion**: `{ session_id, question: QuestionSummary, sequence_order, total_count, session_status }`
  — Derived view; carries QuestionSummary (ADR-002 boundary — never includes answer or explanation)

### Aggregates

- **Session (Aggregate Root)**: Members: Session + SessionQuestion[]
  — Invariants: All SessionQuestions belong to this session; sequence_orders are contiguous from 1 to N; question_count matches actual SessionQuestion count after creation
  — Access pattern: SessionQuestions are only created/modified through Session aggregate operations

### Domain Events

- **SessionCreated**: Trigger: POST /api/v1/sessions succeeds — Payload: `{ sessionId, userId, questionCount, firstQuestionId }`
- **QuestionDelivered**: Trigger: GET /api/v1/sessions/:id/questions/current — Payload: `{ sessionId, questionId, sequenceOrder }`
- **SessionCompleted**: Trigger: all SessionQuestions have answer_revealed = true — Payload: `{ sessionId, completedAt }` *(deferred to bolt 005)*

### Domain Services

- **SessionService**: Operations: `createSession(config, userId)`, `getCurrentQuestion(sessionId, userId)`
  — Dependencies: questionBankService (for question fetch), SessionRepository

- **SessionConfigValidator**: Operations: `validate(body) → SessionConfig | throws BadRequestError`
  — Pure validation function; Zod schema enforcement; validates Topic enum membership

### Repository Interfaces

- **SessionRepository**: Entity: Session
  — Methods:
    - `create(session, questions[]) → Session` — atomic transaction (session + session_questions)
    - `findById(id, userId) → Session | null` — user-scoped ownership check
    - `findCurrentQuestion(sessionId, userId) → CurrentQuestion | null` — lowest sequence_order where answer_revealed = false

### Ubiquitous Language

- **Session**: A single mock interview instance with fixed config and an ordered question sequence
- **SessionConfig**: The immutable parameter set (topics, difficulty, experience level, count) chosen at session start
- **SessionQuestion**: A junction record linking a question to a session, carrying order and progress state
- **Current Question**: The active question — lowest sequence_order where answer_revealed = false; null when session is complete
- **sequence_order**: 1-based integer assigning delivery position to each question in a session
- **question_count**: Actual number of questions in the session (may be less than requested if bank has insufficient — ADR-004 gapCount)
- **gapCount**: Signal from questionBankService indicating how many fewer questions it provided than requested; session is created with actual count (not requested count)
- **in_progress**: Session status while at least one question remains unrevealed
- **completed**: Session status when all questions have been revealed (set by bolt 005)
