---
stage: model
bolt: 005-interview-session-service
created: 2026-03-06T00:00:00Z
---

## Static Model: Interview Session Service — Quality Constraints + Answer Reveal

### Entities

- **InterviewSessionQuestion** (extended from bolt 004): `answer_revealed` transitions false → true on reveal; `revealed_at` set at reveal time.
  — Business Rules: reveal is idempotent (second reveal returns same answer without error); reveal allowed even when session.status = completed (for review); answer_revealed = true means question is "done" in session flow

### Value Objects

- **QuestionMix**: `{ theoryCount: int, scenarioCount: int, minPerType: int }`
  — Computed: minPerType = max(2, floor(count × 0.30)); enforced before questions are committed to session; ephemeral (not persisted)

- **TypeGap**: `{ theory: int, scenario: int }`
  — Number of questions of each type still needed after bank query; drives targeted AI generation

### Aggregates

- **InterviewSession** (extended): The reveal operation is a session aggregate boundary — revealAnswer(questionId) transitions SessionQuestion.answer_revealed and returns full Question (ADR-002 — first time answer/explanation is exposed)
  — Invariant: answer can only be revealed if sessionQuestion.session_id == session.id and session.user_id == requesting user

### Domain Events

- **AnswerRevealed**: Trigger: POST .../reveal succeeds — Payload: `{ sessionId, questionId, revealedAt, userId }`
  — Side effect: if this is the last unrevealed question, session.status transitions to completed

### Domain Services

- **MixEnforcer**: Pure function — `enforceMix(questions, count) → { theoryGap, scenarioGap }`
  — Counts theory vs scenario in fetched set; computes per-type shortfall against minPerType

- **InterviewSessionService** (extended): Gains `revealAnswer(sessionId, questionId, userId) → Question`
  — Enforces ownership, delegates atomic reveal to repository, fetches full Question from questionRepository

### Repository Interfaces

- **interviewSessionRepository** (extended):
  — `revealQuestion(sessionId, questionId) → { questionId: string, alreadyRevealed: bool }` — atomic update (answer_revealed=true, revealed_at=now); returns null if question not in session
  — `completeSession(sessionId) → void` — sets status=completed, completed_at=now

- **questionRepository** (existing):
  — `findById(id) → Question | null` — returns full shape including answer; used only after reveal authorization (ADR-002 boundary)

### Ubiquitous Language

- **TypeGap**: Number of questions of a specific type (theory/scenario) needed but unavailable in the bank
- **Mix constraint**: Each session must have ≥ max(2, floor(count × 0.30)) theory AND ≥ max(2, floor(count × 0.30)) scenario questions
- **minPerType**: Minimum questions per type = max(2, floor(count × 0.30))
- **Reveal**: Explicit user action unlocking answer + explanation + keyConcepts for a session question
- **Idempotent reveal**: Second reveal of same question returns same data without error
- **Last reveal**: When all SessionQuestions have answer_revealed=true; triggers session completion
