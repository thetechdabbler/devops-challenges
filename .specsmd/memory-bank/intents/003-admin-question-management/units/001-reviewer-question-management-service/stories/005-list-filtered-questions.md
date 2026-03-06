---
id: 005-list-filtered-questions
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: complete
priority: must
created: 2026-03-06T08:40:22.000Z
assigned_bolt: 012-reviewer-question-management-service
implemented: true
---

# Story: 005-list-filtered-questions

## User Story

**As a** reviewer
**I want** a fast filtered list of questions
**So that** I can find and update records quickly

## Acceptance Criteria

- [ ] **Given** filters (topic/type/difficulty/level/status), **When** list is requested, **Then** only matching rows are returned.
- [ ] **Given** large datasets, **When** list is requested, **Then** results are paginated with stable ordering.
- [ ] **Given** no filters, **When** list is requested, **Then** default reviewer list is returned with metadata for edit/archive actions.

## Technical Notes

- Prefer keyset pagination where possible; cursor or page metadata must be deterministic.
- Include fields required by UI cards/tables.

## Dependencies

### Requires
- 001-reviewer-role-access-control

### Enables
- 001-reviewer-module-entry

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unsupported filter value | Validation error with actionable message |
| Page token points to removed row | Graceful fallback to next valid window |

## Out of Scope

- Full-text semantic search ranking
