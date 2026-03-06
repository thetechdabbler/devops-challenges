---
id: 006-audit-trail-recording
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 013-reviewer-question-management-service
implemented: false
---

# Story: 006-audit-trail-recording

## User Story

**As a** platform owner
**I want** immutable audit events for reviewer CRUD actions
**So that** I can trace changes and support investigations

## Acceptance Criteria

- [ ] **Given** create/update/archive mutation, **When** operation succeeds, **Then** an audit event is recorded with actor/action/timestamp.
- [ ] **Given** update/archive operation, **When** audit event is created, **Then** before/after snapshots or diff are preserved.
- [ ] **Given** audit query for recent window, **When** requested, **Then** events are retrievable within latency target.

## Technical Notes

- Mutation + audit event should be transactionally consistent.
- Audit records must be immutable after write.

## Dependencies

### Requires
- 002-create-question-validation
- 003-update-question-with-version-check
- 004-soft-delete-question

### Enables
- 004-conflict-and-stale-data-recovery

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Mutation succeeds but audit write fails | Mutation rolled back or explicit failure contract enforced |
| Large payload diffs | Truncate/normalize while preserving forensic value |

## Out of Scope

- External SIEM export pipeline
