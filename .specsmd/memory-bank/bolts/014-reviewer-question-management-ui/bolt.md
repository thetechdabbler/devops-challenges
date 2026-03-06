---
id: 014-reviewer-question-management-ui
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
type: simple-construction-bolt
status: planned
stories:
  - 001-reviewer-module-entry
  - 002-question-form-create-edit
  - 003-delete-confirmation-and-archive
  - 004-conflict-and-stale-data-recovery
created: 2026-03-06T08:40:22Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 012-reviewer-question-management-service
  - 013-reviewer-question-management-service
enables_bolts: []
requires_units:
  - 001-reviewer-question-management-service
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 2
---

## Bolt: 014-reviewer-question-management-ui

### Objective
Implement complete reviewer-facing UX for listing, create/edit, archive confirmation, and conflict recovery flows.

### Stories Included

- [ ] **001-reviewer-module-entry**: Reviewer navigation and module entry - Priority: Must
- [ ] **002-question-form-create-edit**: Create/edit form UX with validation display - Priority: Must
- [ ] **003-delete-confirmation-and-archive**: Archive confirmation safeguards - Priority: Must
- [ ] **004-conflict-and-stale-data-recovery**: Handle stale-data conflicts and refresh flow - Priority: Must

### Expected Outputs
- Reviewer management routes/pages/components integrated in frontend app
- Form UX for create/edit with server validation mapping
- Archive confirmation and conflict-recovery interaction patterns

### Dependencies

#### Bolt Dependencies (within intent)
- **012-reviewer-question-management-service** (Required)
- **013-reviewer-question-management-service** (Required)

#### Unit Dependencies (cross-unit)
- **001-reviewer-question-management-service**

#### Enables (other bolts waiting on this)
- None
