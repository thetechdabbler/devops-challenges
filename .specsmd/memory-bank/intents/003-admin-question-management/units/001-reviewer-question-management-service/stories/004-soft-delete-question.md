---
id: 004-soft-delete-question
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 013-reviewer-question-management-service
implemented: false
---

# Story: 004-soft-delete-question

## User Story

**As a** reviewer
**I want** deletes to archive records instead of hard-delete
**So that** accidental deletes can be controlled and historical context is retained

## Acceptance Criteria

- [ ] **Given** reviewer confirms delete, **When** archive endpoint is called, **Then** question status becomes archived/inactive.
- [ ] **Given** archived question, **When** active interview selection runs, **Then** archived question is excluded.
- [ ] **Given** repeated archive call for same question, **When** request is made, **Then** response is idempotent.

## Technical Notes

- Preserve record for audit and optional future restore.
- Ensure repository filters exclude archived by default for active paths.

## Dependencies

### Requires
- 001-reviewer-role-access-control

### Enables
- 003-delete-confirmation-and-archive

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Archive request for unknown ID | Return deterministic not-found/error response |
| Archive on already archived row | Return success/idempotent response without mutation |

## Out of Scope

- Permanent hard-delete capability
