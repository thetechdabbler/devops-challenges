---
id: 003-import-upload-and-mode
unit: 002-question-transfer-ui
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 011-question-transfer-ui
implemented: true
---

# Story: 003-import-upload-and-mode

## User Story

**As an** authenticated user
**I want** to upload CSV and choose dry-run or apply
**So that** I can safely validate before persisting changes

## Acceptance Criteria

- [ ] **Given** a CSV file is selected, **When** I submit in dry-run mode, **Then** no persistence occurs and validation report is shown.
- [ ] **Given** a CSV file is selected, **When** I submit in apply mode, **Then** valid non-duplicate rows are persisted.
- [ ] **Given** submit is in progress, **When** request is pending, **Then** controls show loading/disabled state.

## Technical Notes

- Multipart request with explicit `mode` field.

## Dependencies

### Requires
- 002-export-filters-and-download

### Enables
- 004-import-reporting-ui

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No file selected | Client validation blocks submit |
| Unsupported extension selected | User sees clear local validation message |

## Out of Scope

- Drag-and-drop bulk queue uploads
