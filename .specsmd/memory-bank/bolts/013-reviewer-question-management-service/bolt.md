---
id: 013-reviewer-question-management-service
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
type: ddd-construction-bolt
status: in-progress
stories:
  - 003-update-question-with-version-check
  - 004-soft-delete-question
  - 006-audit-trail-recording
created: 2026-03-06T08:40:22Z
started: 2026-03-06T10:52:44Z
completed: null
current_stage: test
stages_completed:
  - name: domain-model
    completed: 2026-03-06T10:52:44Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T11:03:40Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T11:04:58Z
    artifact: none (no new ADR required; decisions covered by ADR-014, ADR-015, ADR-016)
  - name: implement
    completed: 2026-03-06T11:12:47Z
    artifact: prisma/schema.prisma, prisma/migrations/20260306110500_add_question_version_and_audit_events/migration.sql, src/lib/errors.ts, src/lib/reviewer-question/types.ts, src/repositories/question.repository.ts, src/services/reviewer-question.service.ts, src/controllers/reviewer-question.controller.ts, src/routes/reviewer-question.routes.ts, src/__tests__/reviewer-question.controller.test.ts, src/__tests__/reviewer-question.service.test.ts, frontend/src/api/auth.api.ts
requires_bolts:
  - 012-reviewer-question-management-service
enables_bolts:
  - 014-reviewer-question-management-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

## Bolt: 013-reviewer-question-management-service

### Objective
Deliver safe mutation workflows with stale-write conflict prevention, archive semantics, and immutable audit trail recording.

### Stories Included

- [ ] **003-update-question-with-version-check**: Update with stale-write conflict protection - Priority: Must
- [ ] **004-soft-delete-question**: Archive question with idempotent delete behavior - Priority: Must
- [ ] **006-audit-trail-recording**: Immutable audit events for CRUD actions - Priority: Must

### Expected Outputs
- Conflict-safe update API returning deterministic `409` metadata
- Soft-delete archive behavior integrated with active question filtering
- Audit persistence for all mutation events

### Dependencies

#### Bolt Dependencies (within intent)
- **012-reviewer-question-management-service** (Required)

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 014-reviewer-question-management-ui
