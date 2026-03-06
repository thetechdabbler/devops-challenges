---
id: 004-import-reporting-ui
unit: 002-question-transfer-ui
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 011-question-transfer-ui
implemented: true
---

# Story: 004-import-reporting-ui

## User Story

**As an** authenticated user
**I want** clear summary and row-level error reporting
**So that** I can quickly correct bad data and rerun import

## Acceptance Criteria

- [ ] **Given** import completes, **When** report renders, **Then** totals for valid/invalid/inserted/duplicates are visible.
- [ ] **Given** invalid rows exist, **When** report renders, **Then** row index and message are displayed.
- [ ] **Given** duplicate rows are skipped, **When** report renders, **Then** duplicate count is clearly labeled.

## Technical Notes

- Reuse existing table/card styling patterns in frontend.

## Dependencies

### Requires
- 003-import-upload-and-mode

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very large error list | Paginate or cap rendered rows with summary notice |
| Mixed warning+error states | Separate sections for readability |

## Out of Scope

- CSV export of error report
