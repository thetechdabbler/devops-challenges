---
id: 001-export-questions-csv
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 009-question-transfer-service
implemented: true
---

# Story: 001-export-questions-csv

## User Story

**As an** authenticated user
**I want** to export interview questions as CSV using filters
**So that** I can port question data to another environment

## Acceptance Criteria

- [ ] **Given** valid filters, **When** I request export, **Then** the API returns a CSV file containing matching questions.
- [ ] **Given** no filters are provided, **When** export is requested, **Then** all eligible questions are exported.
- [ ] **Given** exported rows, **When** opened in spreadsheet tools, **Then** required columns are present and consistently ordered.

## Technical Notes

- Include: text, topics, type, difficulty, experience_level, answer, explanation, key_concepts, status.
- Reuse repository query filters where possible.

## Dependencies

### Requires
- None

### Enables
- 002-import-dry-run-validation

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty result set | Return header-only CSV with 200 status |
| Special characters/newlines in fields | CSV escaping is correct and reversible |

## Out of Scope

- JSON export format
