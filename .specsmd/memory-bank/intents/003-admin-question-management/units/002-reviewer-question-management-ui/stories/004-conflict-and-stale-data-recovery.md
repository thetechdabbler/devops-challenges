---
id: 004-conflict-and-stale-data-recovery
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 014-reviewer-question-management-ui
implemented: false
---

# Story: 004-conflict-and-stale-data-recovery

## User Story

**As a** reviewer
**I want** clear conflict handling when my edit is stale
**So that** I can safely reconcile and resubmit changes

## Acceptance Criteria

- [ ] **Given** API returns `409` conflict, **When** update fails, **Then** UI shows stale-data message with latest record details.
- [ ] **Given** conflict payload available, **When** reviewer chooses refresh, **Then** form is updated with latest server state.
- [ ] **Given** reviewer re-edits after refresh, **When** resubmitting with latest token, **Then** update succeeds.

## Technical Notes

- Keep original draft visible to reviewer when possible for manual reconciliation.
- Provide deterministic refresh/retry CTA.

## Dependencies

### Requires
- 002-question-form-create-edit
- 003-update-question-with-version-check
- 006-audit-trail-recording

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Multiple consecutive conflicts | UI keeps latest token and repeatable recovery flow |
| Conflict payload missing optional fields | Fallback to full record refetch |

## Out of Scope

- Automated three-way merge UI
