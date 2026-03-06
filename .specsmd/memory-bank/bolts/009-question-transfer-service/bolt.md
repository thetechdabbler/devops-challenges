---
id: 009-question-transfer-service
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
type: ddd-construction-bolt
status: complete
stories:
  - 001-export-questions-csv
  - 002-import-dry-run-validation
created: 2026-03-06T06:46:51.000Z
started: 2026-03-06T07:58:10.000Z
completed: "2026-03-06T08:05:44Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-06T08:01:30.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T08:05:10.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T08:08:30.000Z
    artifact: adr-012-single-import-endpoint-with-mode.md
  - name: implement
    completed: 2026-03-06T08:17:20.000Z
    artifact: src/lib/question-transfer/types.ts, src/lib/question-transfer/csv.ts, src/services/question-transfer.service.ts, src/controllers/question-transfer.controller.ts, src/routes/question-transfer.routes.ts, src/repositories/question.repository.ts, src/index.ts, src/__tests__/question-transfer.service.test.ts, src/__tests__/question-transfer.controller.test.ts
  - name: test
    completed: 2026-03-06T08:24:10.000Z
    artifact: ddd-03-test-report.md
requires_bolts: []
enables_bolts:
  - 010-question-transfer-service
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

## Bolt: 009-question-transfer-service

### Objective
Establish the transfer foundation by implementing CSV export and dry-run import validation.

### Stories Included

- [ ] **001-export-questions-csv**: Export question bank as CSV - Priority: Must
- [ ] **002-import-dry-run-validation**: Import dry-run validation report - Priority: Must

### Expected Outputs
- Backend endpoints for export and dry-run import
- CSV serializer/parser and validation baseline
- Test coverage for happy/error paths

### Dependencies

#### Bolt Dependencies (within intent)
- None

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 010-question-transfer-service
