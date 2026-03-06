---
id: 002-export-filters-and-download
unit: 002-question-transfer-ui
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 011-question-transfer-ui
implemented: true
---

# Story: 002-export-filters-and-download

## User Story

**As an** authenticated user
**I want** to apply filters and download exported questions
**So that** I can move only the data I need

## Acceptance Criteria

- [ ] **Given** filter controls, **When** I set values and click export, **Then** the module downloads CSV from API.
- [ ] **Given** no matching records, **When** export completes, **Then** I still receive a valid header-only file.
- [ ] **Given** export failure, **When** API returns error, **Then** user sees actionable error feedback.

## Technical Notes

- Preserve filename with timestamp for traceability.

## Dependencies

### Requires
- 001-import-export-module-entry

### Enables
- 003-import-upload-and-mode

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Repeated export clicks | Disable button while request is in-flight |
| Browser blocks download popups | Fallback to blob-link download approach |

## Out of Scope

- Scheduled exports
