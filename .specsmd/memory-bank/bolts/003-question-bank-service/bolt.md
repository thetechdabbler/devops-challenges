---
id: 003-question-bank-service
unit: 001-question-bank-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
started: 2026-03-06T00:00:00.000Z
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
    artifact: adr-005-role-cached-in-jwt.md, adr-006-flat-role-enum-not-rbac.md
  - name: implement
    completed: 2026-03-06T00:00:00.000Z
    artifact: prisma/schema.prisma, src/middleware/admin.middleware.ts, src/repositories/question.repository.ts, src/services/admin-question.service.ts, src/controllers/admin-question.controller.ts, src/routes/admin.routes.ts, src/index.ts
  - name: test
    completed: 2026-03-06T00:00:00.000Z
    artifact: src/__tests__/admin-question.service.test.ts, src/__tests__/admin-question.controller.test.ts
stories:
  - 006-admin-bulk-generation
  - 007-admin-review-approve-reject
  - 008-admin-bank-stats
created: 2026-03-06T00:00:00.000Z
requires_bolts:
  - 002-question-bank-service
enables_bolts:
  - 008-devops-interview-bot-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
completed: "2026-03-06T03:19:41Z"
---

## Bolt: 003-question-bank-service

### Objective
Build the admin management layer: bulk AI generation endpoint, question review/approve/reject workflow, and bank statistics API.

### Stories Included

- [ ] **006-admin-bulk-generation**: POST /api/v1/admin/questions/generate — admin-triggered bulk generation (status=pending_review) — Priority: Should
- [ ] **007-admin-review-approve-reject**: PATCH /api/v1/admin/questions/:id — approve/reject/edit pending questions — Priority: Should
- [ ] **008-admin-bank-stats**: GET /api/v1/admin/questions/stats — aggregate counts by topic/difficulty/type/status — Priority: Should

### Expected Outputs
- `app/api/v1/admin/questions/generate/route.ts`
- `app/api/v1/admin/questions/[id]/route.ts`
- `app/api/v1/admin/questions/stats/route.ts`
- `lib/question-bank/stats.ts` — aggregation query
- Admin role middleware check
- API tests for all three endpoints

### Dependencies

#### Bolt Dependencies (within intent)
- **002-question-bank-service** (Required): Needs generation and save functions

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 008-devops-interview-bot-ui (admin UI needs all admin APIs)
