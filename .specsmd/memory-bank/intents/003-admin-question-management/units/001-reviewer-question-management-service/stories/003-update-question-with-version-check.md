---
id: 003-update-question-with-version-check
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 013-reviewer-question-management-service
implemented: false
---

# Story: 003-update-question-with-version-check

## User Story

**As a** reviewer
**I want** updates to fail when my data is stale
**So that** I do not accidentally overwrite newer reviewer changes

## Acceptance Criteria

- [ ] **Given** an update with current revision token, **When** submitted, **Then** update succeeds and revision token advances.
- [ ] **Given** an update with stale revision token, **When** submitted, **Then** API returns `409` with latest record metadata.
- [ ] **Given** repeated stale submission without refresh, **When** retried, **Then** it consistently returns conflict.

## Technical Notes

- Use optimistic concurrency via `updatedAt` or explicit `version`.
- Return deterministic conflict response payload for UI recovery flow.

## Dependencies

### Requires
- 002-create-question-validation

### Enables
- 004-conflict-and-stale-data-recovery

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Concurrent updates land within same second | Version/token comparison remains deterministic |
| Update payload omits revision token | Reject with validation error |

## Out of Scope

- Merge/conflict auto-resolution logic
