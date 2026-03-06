---
id: 003-delete-confirmation-and-archive
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 014-reviewer-question-management-ui
implemented: false
---

# Story: 003-delete-confirmation-and-archive

## User Story

**As a** reviewer
**I want** explicit delete confirmation and archive semantics in UI
**So that** I avoid accidental destructive actions

## Acceptance Criteria

- [ ] **Given** reviewer triggers delete, **When** action starts, **Then** confirmation dialog is shown with clear warning text.
- [ ] **Given** reviewer confirms delete, **When** archive API succeeds, **Then** row is removed from active list and success notice shown.
- [ ] **Given** reviewer cancels confirmation, **When** dialog closes, **Then** no mutation request is sent.

## Technical Notes

- Label action as "Archive" where possible to reduce ambiguity.
- Handle idempotent responses gracefully.

## Dependencies

### Requires
- 001-reviewer-module-entry
- 004-soft-delete-question

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Row already archived by another reviewer | UI refreshes and informs user |
| Network timeout on archive call | Preserve row and show retryable error |

## Out of Scope

- Permanent delete workflow
