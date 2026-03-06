---
id: 006-interview-session-service
unit: 002-interview-session-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
started: 2026-03-06T04:56:24.000Z
stages_completed:
  - name: domain-model
    completed: 2026-03-06T04:58:01.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T04:58:01.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T04:59:03.000Z
    artifact: adr-010-keyset-pagination-for-session-history.md, adr-011-review-mode-always-returns-answer-content.md
  - name: implement
    completed: 2026-03-06T05:03:07.000Z
    artifact: portal/backend/src/lib/session/types.ts, portal/backend/src/repositories/interview-session.repository.ts, portal/backend/src/services/interview-session.service.ts, portal/backend/src/controllers/interview-session.controller.ts, portal/backend/src/routes/interview-session.routes.ts, portal/backend/src/__tests__/interview-session.service.test.ts, portal/backend/src/__tests__/interview-session.controller.test.ts
  - name: test
    completed: 2026-03-06T05:12:49.000Z
    artifact: ddd-03-test-report.md
current_stage: null
stories:
  - 007-self-rating
  - 008-session-history-list
  - 009-session-review
created: 2026-03-06T00:00:00.000Z
requires_bolts:
  - 005-interview-session-service
enables_bolts:
  - 007-devops-interview-bot-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
completed: "2026-03-06T05:13:29Z"
---

## Bolt: 006-interview-session-service

### Objective
Complete the session lifecycle: self-rating endpoint, paginated session history, and full session detail for review. This bolt closes the interview loop and enables the history feature.

### Stories Included

- [ ] **007-self-rating**: POST /api/v1/sessions/:sessionId/questions/:questionId/rate — Priority: Must
- [ ] **008-session-history-list**: GET /api/v1/sessions with cursor-based pagination — Priority: Must
- [ ] **009-session-review**: GET /api/v1/sessions/:id (full session detail with all questions) — Priority: Must

### Expected Outputs
- `app/api/v1/sessions/[sessionId]/questions/[questionId]/rate/route.ts`
- `app/api/v1/sessions/route.ts` GET handler (paginated list)
- `app/api/v1/sessions/[sessionId]/route.ts` GET handler (session detail)
- Updated `lib/interview-session/service.ts` — submitRating, listSessions, getSessionDetail
- Integration tests for all three endpoints

### Dependencies

#### Bolt Dependencies (within intent)
- **005-interview-session-service** (Required): Reveal must exist before rating

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 007-devops-interview-bot-ui (frontend needs all session APIs)
