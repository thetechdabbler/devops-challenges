---
id: 011-question-transfer-ui
unit: 002-question-transfer-ui
intent: 002-interview-question-import-export
type: simple-construction-bolt
status: complete
stories:
  - 001-import-export-module-entry
  - 002-export-filters-and-download
  - 003-import-upload-and-mode
  - 004-import-reporting-ui
created: 2026-03-06T06:46:51.000Z
started: 2026-03-06T08:56:10.000Z
completed: "2026-03-06T09:06:40Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-06T08:56:10.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-06T09:02:10.000Z
    artifact: portal/frontend/src/api/question-transfer.api.ts, portal/frontend/src/pages/QuestionTransferPage.tsx, portal/frontend/src/App.tsx, portal/frontend/src/components/Layout.tsx, implementation-walkthrough.md
  - name: test
    completed: 2026-03-06T09:06:40Z
    artifact: test-walkthrough.md
requires_bolts:
  - 010-question-transfer-service
enables_bolts: []
requires_units:
  - 001-question-transfer-service
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

## Bolt: 011-question-transfer-ui

### Objective
Deliver the authenticated-user import/export module with dry-run/apply UX and detailed reporting.

### Stories Included

- [ ] **001-import-export-module-entry**: Import/export module access for authenticated users - Priority: Must
- [ ] **002-export-filters-and-download**: Export filters and CSV download action - Priority: Must
- [ ] **003-import-upload-and-mode**: File upload with dry-run/apply modes - Priority: Must
- [ ] **004-import-reporting-ui**: Validation/apply summary and row-level error display - Priority: Must

### Expected Outputs
- New frontend page/components for import/export
- API client integration for export and import actions
- UI test coverage for module interactions and reporting

### Dependencies

#### Bolt Dependencies (within intent)
- **010-question-transfer-service** (Required)

#### Unit Dependencies (cross-unit)
- **001-question-transfer-service** (Required)

#### Enables (other bolts waiting on this)
- None
