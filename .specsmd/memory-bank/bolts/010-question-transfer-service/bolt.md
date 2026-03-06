---
id: 010-question-transfer-service
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
type: ddd-construction-bolt
status: complete
stories:
  - 003-idempotent-dedup-logic
  - 004-import-apply-persistence
  - 005-import-error-reporting
  - 006-import-api-contract
created: 2026-03-06T06:46:51.000Z
started: 2026-03-06T08:27:41.000Z
completed: "2026-03-06T08:49:10Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-06T08:31:10.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T08:35:20.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T08:41:00.000Z
    artifact: adr-013-deterministic-fingerprint-for-idempotent-imports.md
  - name: implement
    completed: 2026-03-06T08:45:22.000Z
    artifact: src/services/question-transfer.service.ts, src/repositories/question.repository.ts, src/controllers/question-transfer.controller.ts, src/routes/question-transfer.routes.ts, src/lib/question-transfer/types.ts, src/__tests__/question-transfer.service.test.ts, src/__tests__/question-transfer.controller.test.ts
  - name: test
    completed: 2026-03-06T08:49:10Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 009-question-transfer-service
enables_bolts:
  - 011-question-transfer-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

## Bolt: 010-question-transfer-service

### Objective
Implement idempotent apply-mode import pipeline with deterministic deduplication and stable API contract.

### Stories Included

- [ ] **003-idempotent-dedup-logic**: Idempotent deduplication for import apply - Priority: Must
- [ ] **004-import-apply-persistence**: Persist valid rows with transactional safety - Priority: Must
- [ ] **005-import-error-reporting**: Row-level error reporting and summary metrics - Priority: Must
- [ ] **006-import-api-contract**: API contract for import/export workflows - Priority: Must

### Expected Outputs
- Apply-mode import service with deduplication
- Structured summary/error payloads for UI
- Tests for idempotency and bad-data handling

### Dependencies

#### Bolt Dependencies (within intent)
- **009-question-transfer-service** (Required)

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 011-question-transfer-ui
