---
id: 002-import-dry-run-validation
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 009-question-transfer-service
implemented: true
---

# Story: 002-import-dry-run-validation

## User Story

**As an** authenticated user
**I want** to upload a CSV in dry-run mode
**So that** I can see validation issues before writing to the database

## Acceptance Criteria

- [ ] **Given** a CSV file upload with mode=dry-run, **When** processed, **Then** no rows are persisted.
- [ ] **Given** malformed rows, **When** dry-run completes, **Then** row-level validation errors are returned.
- [ ] **Given** valid rows, **When** dry-run completes, **Then** valid count is included in the summary.

## Technical Notes

- Validate required fields and enum values.
- Return row index and field-level error message.

## Dependencies

### Requires
- 001-export-questions-csv

### Enables
- 003-idempotent-dedup-logic

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unsupported file extension | 400 with clear format error |
| Oversized file | 413 or configured validation error |

## Out of Scope

- Persistence of valid rows
