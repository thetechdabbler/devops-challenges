---
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
phase: inception
status: complete
created: 2026-03-06T06:46:51.000Z
updated: 2026-03-06T06:46:51.000Z
---

# Unit Brief: Question Transfer Service

## Purpose

Build the backend import/export capability for question portability with strict validation and idempotent persistence.

## Scope

### In Scope
- CSV export generation for question bank records
- CSV import parsing and row normalization
- Row-level validation and structured error reporting
- Idempotency and deduplication on import apply
- Import run summary metrics and audit metadata

### Out of Scope
- Import/export page and visual interaction patterns
- Role-management changes

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-2 | Export Questions for Portability | Must |
| FR-3 | Idempotent Import (No Duplicate Inserts) | Must |
| FR-4 | Bad Data Detection and Safe Handling | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| QuestionTransferRow | Normalized import/export row representation | text, topics, type, difficulty, experience_level, answer, explanation, key_concepts, status |
| ImportValidationIssue | Validation failure per row | row_index, field, code, message |
| ImportRunSummary | Aggregate import operation result | total, valid, invalid, inserted, duplicate, mode |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| exportQuestions | Produce CSV from filtered questions | filters | CSV stream/text |
| validateImportFile | Parse and validate CSV in dry-run mode | CSV file | validation report |
| applyImportFile | Persist valid rows with idempotent dedup | CSV file | apply summary |
| buildDedupKey | Deterministic duplicate detection key | normalized row | dedup key |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 6 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-export-questions-csv | Export question bank as CSV | Must | Planned |
| 002-import-dry-run-validation | Import dry-run validation report | Must | Planned |
| 003-idempotent-dedup-logic | Idempotent deduplication for import apply | Must | Planned |
| 004-import-apply-persistence | Persist valid rows with transactional safety | Must | Planned |
| 005-import-error-reporting | Row-level error reporting and summary metrics | Must | Planned |
| 006-import-api-contract | API contract for import/export workflows | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| Existing question-bank-service domain | Reuse Question schema and repository patterns |

### Depended By
| Unit | Reason |
|------|--------|
| 002-question-transfer-ui | UI consumes import/export APIs and reports |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Browser file upload/download | Transfer CSV payloads | Low |

---

## Technical Context

### Suggested Technology
- Node/Express handlers in existing backend service
- Prisma for DB read/write
- CSV parser/stringifier library compatible with streaming or buffered processing

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Frontend import/export module | Internal API | HTTP JSON + multipart |
| Question repository | Internal | TypeScript service call |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Questions | PostgreSQL | 10k+ rows | Permanent |
| Import operation logs | PostgreSQL/application logs | 1k+ runs | 90 days minimum |

---

## Constraints

- Must preserve idempotency for repeated imports of identical logical questions.
- Must reject malformed rows and avoid inserting invalid data.
- Must keep import/export field schema stable and documented.

---

## Success Criteria

### Functional
- [ ] CSV export returns complete, schema-valid rows.
- [ ] Dry-run reports valid/invalid rows without DB writes.
- [ ] Apply mode inserts valid non-duplicate rows only.
- [ ] Re-importing same dataset creates zero duplicate inserts.

### Non-Functional
- [ ] 1,000-row dry-run completes in < 5s.
- [ ] 1,000-row apply completes in < 8s.

### Quality
- [ ] Unit/integration tests cover parser, validator, dedup, and apply paths.
- [ ] All acceptance criteria in stories are testable and automated where possible.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 009-question-transfer-service | ddd-construction-bolt | 001, 002 | Deliver export + dry-run validation baseline |
| 010-question-transfer-service | ddd-construction-bolt | 003, 004, 005, 006 | Deliver idempotent apply pipeline + API contract |
