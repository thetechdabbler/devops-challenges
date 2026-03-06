---
id: 001-reviewer-role-access-control
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: complete
priority: must
created: 2026-03-06T08:40:22.000Z
assigned_bolt: 012-reviewer-question-management-service
implemented: true
---

# Story: 001-reviewer-role-access-control

## User Story

**As a** platform owner
**I want** reviewer role checks enforced on question management APIs
**So that** only authorized reviewers can perform management actions

## Acceptance Criteria

- [ ] **Given** an unauthenticated request, **When** it hits reviewer management endpoints, **Then** the API returns `401`.
- [ ] **Given** an authenticated non-reviewer user, **When** they call reviewer management endpoints, **Then** the API returns `403`.
- [ ] **Given** an authenticated reviewer, **When** they call reviewer management endpoints, **Then** access is granted.

## Technical Notes

- Reuse existing auth middleware and extend role guard for `reviewer`.
- Apply guard consistently to list/create/update/archive routes.

## Dependencies

### Requires
- None

### Enables
- 002-create-question-validation
- 005-list-filtered-questions

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| JWT valid but role claim missing | Treat as unauthorized (`403`) |
| Role claim in unexpected case | Normalize and validate deterministically |

## Out of Scope

- Reviewer role assignment UI/workflow
