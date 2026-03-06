---
id: 005-interview-session-service
unit: 002-interview-session-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-06T00:00:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T00:00:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T00:00:00.000Z
    artifact: adr-008-mix-enforcement-in-question-bank-service.md, adr-009-session-auto-completes-on-last-reveal.md
  - name: implement
    completed: 2026-03-06T04:00:02.000Z
    artifact: portal/backend/src/lib/question-bank/mix.ts, portal/backend/src/services/question-bank.service.ts, portal/backend/src/services/interview-session.service.ts, portal/backend/src/repositories/interview-session.repository.ts, portal/backend/src/controllers/interview-session.controller.ts, portal/backend/src/routes/interview-session.routes.ts, portal/backend/src/lib/session/types.ts
  - name: test
    completed: 2026-03-06T04:54:15Z
    artifact: ddd-03-test-report.md, portal/backend/src/__tests__/interview-session.service.test.ts, portal/backend/src/__tests__/interview-session.controller.test.ts, portal/backend/src/__tests__/question-bank.service.test.ts, portal/backend/src/__tests__/mix.test.ts
stories:
  - 004-mixed-question-types
  - 005-no-duplicates-in-session
  - 006-answer-reveal
created: 2026-03-06T00:00:00.000Z
requires_bolts:
  - 004-interview-session-service
  - 002-question-bank-service
enables_bolts:
  - 006-interview-session-service
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
completed: "2026-03-06T04:54:15Z"
---

## Bolt: 005-interview-session-service

### Objective
Implement question quality constraints and answer reveal: enforce theory/scenario mix, integrate cross-session deduplication, and build the answer reveal endpoint.

### Stories Included

- [ ] **004-mixed-question-types**: Mix enforcement (≥30% theory, ≥30% scenario) in session creation — Priority: Must
- [ ] **005-no-duplicates-in-session**: Cross-session 30-day dedup integration — Priority: Must
- [ ] **006-answer-reveal**: POST /api/v1/sessions/:sessionId/questions/:questionId/reveal — Priority: Must

### Expected Outputs
- Updated `lib/interview-session/service.ts` — createSession with mix + dedup constraints
- `app/api/v1/sessions/[sessionId]/questions/[questionId]/reveal/route.ts`
- Integration tests for mix enforcement and dedup
- Integration test for reveal flow

### Dependencies

#### Bolt Dependencies (within intent)
- **004-interview-session-service** (Required): Session core must exist
- **002-question-bank-service** (Required): Dedup uses user_question_history

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 006-interview-session-service (rating + history need reveal)
