---
stage: design
bolt: 006-interview-session-service
created: 2026-03-06T04:58:01Z
---

## Technical Design: Interview Session Service - Rating, History, Review

### Architecture Pattern
Layered service + repository pattern consistent with existing backend:
1. Controller layer handles HTTP contract and request validation.
2. Service layer enforces ownership and business rules.
3. Repository layer encapsulates Prisma queries and persistence updates.

### Layer Structure

```text
┌────────────────────────────────────────────────────────────┐
│ Presentation                                               │
│ POST /api/v1/sessions/:sessionId/questions/:questionId/rate│
│ GET  /api/v1/sessions?cursor=&limit=                      │
│ GET  /api/v1/sessions/:id                                 │
├────────────────────────────────────────────────────────────┤
│ Application                                                │
│ interviewSessionService.submitRating                      │
│ interviewSessionService.listSessions                      │
│ interviewSessionService.getSessionDetail                  │
├────────────────────────────────────────────────────────────┤
│ Domain                                                     │
│ rating rules: 1..5, reveal-before-rate, last-write-wins  │
│ history rules: user-scoped, newest-first, cursor paging   │
│ review rules: answers available in review mode             │
├────────────────────────────────────────────────────────────┤
│ Infrastructure                                             │
│ interviewSessionRepository queries + updates               │
│ Prisma models: interview_sessions, interview_session_questions, questions│
└────────────────────────────────────────────────────────────┘
```

### API Design

- **POST `/api/v1/sessions/:sessionId/questions/:questionId/rate`**:
  - Request body: `{ rating: number }`
  - Validation: integer 1..5
  - Success: `{ status: "success", data: { session_id, question_id, self_rating } }`
  - Errors:
    - `400` invalid rating or answer not yet revealed
    - `403` session not owned by requester
    - `404` session or session-question missing

- **GET `/api/v1/sessions?cursor=&limit=`**:
  - Query: optional `cursor`, optional `limit` (default 20, clamp 100)
  - Success: `{ status: "success", data: { items, nextCursor, hasMore } }`
  - Item shape: `id, created_at, topics, difficulty, experience_level, question_count, status, avg_self_rating`
  - Errors: `400` invalid cursor/limit

- **GET `/api/v1/sessions/:id`**:
  - Success: full session with ordered questions and review fields:
    - `question text/type/topics`
    - `answer/explanation/key_concepts` (always in review mode)
    - `answer_revealed`, `self_rating`, `sequence_order`
  - Errors:
    - `403` session belongs to another user
    - `404` session not found

### Data Model

- **Existing models reused**:
  - `InterviewSession`
  - `InterviewSessionQuestion` (`self_rating`, `answer_revealed`, `revealed_at`)
  - `Question`
- **No schema migration required** for bolt 006 scope.

### Security Design

- All endpoints remain under authenticated session routes.
- Ownership check happens before mutation/read detail:
  - `session.user_id === req.user.id` required.
- Question rating requires session-question membership.
- Review/list endpoints never leak other users' sessions.

### NFR Implementation

- **Read performance**:
  - History query uses descending sort + cursor-based pagination.
  - Session detail query fetches one session with ordered child rows.
- **Write performance**:
  - Rating update is single-row update after lightweight precondition checks.
- **Reliability**:
  - Rating endpoint is deterministic with last-write-wins behavior.
  - Null ratings remain valid for skipped questions.

### Integration Plan

1. Extend `interviewSession.repository.ts` with:
   - session-question lookup for rating precondition
   - self-rating update
   - paginated session list with avg rating
   - session detail query with joined question fields
2. Extend `interviewSession.service.ts` with:
   - `submitRating`
   - `listSessions`
   - `getSessionDetail`
3. Extend `interviewSession.controller.ts` and routes:
   - add rate endpoint handler
   - add sessions list handler
   - add session detail handler
4. Add targeted tests:
   - service tests for rating/history/review rules
   - controller tests for request/response and error mapping
