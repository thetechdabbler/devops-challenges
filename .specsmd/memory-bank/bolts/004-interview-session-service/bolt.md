---
id: 004-interview-session-service
unit: 002-interview-session-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-06T00:00:00Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T00:00:00Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T00:00:00Z
    artifact: adr-007-session-created-with-actual-question-count.md
  - name: implement
    completed: 2026-03-06T00:00:00Z
    artifact: prisma/schema.prisma, src/lib/session/types.ts, src/repositories/interview-session.repository.ts, src/services/interview-session.service.ts, src/controllers/interview-session.controller.ts, src/routes/interview-session.routes.ts, src/index.ts
  - name: test
    completed: 2026-03-06T00:00:00Z
    artifact: src/__tests__/interview-session.service.test.ts, src/__tests__/interview-session.controller.test.ts
stories:
  - 001-session-configuration
  - 002-session-created-and-persisted
  - 003-question-delivery-in-sequence
created: 2026-03-06T00:00:00Z

requires_bolts: [001-question-bank-service]
enables_bolts: [005-interview-session-service, 007-devops-interview-bot-ui]
requires_units: []
blocks: true

completed: "2026-03-06T00:00:00Z"
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

## Bolt: 004-interview-session-service

### Objective
Build the session domain core: session schema, creation endpoint with config validation, and question delivery API. This bolt makes interview sessions creatable and navigable.

### Stories Included

- [x] **001-session-configuration**: POST /api/v1/sessions with Zod validation — Priority: Must
- [x] **002-session-created-and-persisted**: Atomic session + session_questions creation, fetches from question bank — Priority: Must
- [x] **003-question-delivery-in-sequence**: GET /api/v1/sessions/:id/questions/current — Priority: Must

### Expected Outputs
- Drizzle schema: sessions, session_questions tables
- `app/api/v1/sessions/route.ts` (POST)
- `app/api/v1/sessions/[sessionId]/questions/current/route.ts` (GET)
- `lib/interview-session/service.ts` — createSession, getCurrentQuestion
- Migration files
- Unit + integration tests

### Dependencies

#### Bolt Dependencies (within intent)
- **001-question-bank-service** (Required): Needs question lookup for session creation

#### Unit Dependencies (cross-unit)
- 001-question-bank-service unit must be complete (bolts 001+002 done)

#### Enables (other bolts waiting on this)
- 005-interview-session-service (builds on session core)
- 007-devops-interview-bot-ui (frontend session flow)
