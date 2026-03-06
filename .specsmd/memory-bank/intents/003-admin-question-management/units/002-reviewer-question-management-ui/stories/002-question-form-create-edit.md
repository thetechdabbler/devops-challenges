---
id: 002-question-form-create-edit
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 014-reviewer-question-management-ui
implemented: false
---

# Story: 002-question-form-create-edit

## User Story

**As a** reviewer
**I want** unified create/edit forms with validation feedback
**So that** I can maintain high-quality questions quickly

## Acceptance Criteria

- [ ] **Given** reviewer opens create form, **When** submitting invalid data, **Then** field-level validation errors are displayed.
- [ ] **Given** valid payload, **When** create or edit is submitted, **Then** success feedback appears and list reflects latest values.
- [ ] **Given** edit mode, **When** form loads, **Then** current question data and revision token are prefilled.

## Technical Notes

- Include required metadata controls: type, topics, difficulty, experience level, status.
- Preserve revision token for update requests.

## Dependencies

### Requires
- 001-reviewer-module-entry
- 002-create-question-validation
- 003-update-question-with-version-check

### Enables
- 004-conflict-and-stale-data-recovery

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Multi-topic selection emptied | Prevent submit and show validation |
| API validation returns multiple fields | Map all errors without dropping any |

## Out of Scope

- Bulk edit UI
