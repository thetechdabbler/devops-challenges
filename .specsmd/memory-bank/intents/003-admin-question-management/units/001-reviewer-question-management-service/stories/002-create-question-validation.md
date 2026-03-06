---
id: 002-create-question-validation
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
status: complete
priority: must
created: 2026-03-06T08:40:22.000Z
assigned_bolt: 012-reviewer-question-management-service
implemented: true
---

# Story: 002-create-question-validation

## User Story

**As a** reviewer
**I want** to create questions with strict server-side validation
**So that** only high-quality records enter the bank

## Acceptance Criteria

- [ ] **Given** required fields are missing or invalid, **When** create is submitted, **Then** API returns field-level validation errors.
- [ ] **Given** all required fields are valid, **When** create is submitted, **Then** question is persisted and returned with ID.
- [ ] **Given** invalid enum values (type/level/status), **When** create is submitted, **Then** request is rejected.

## Technical Notes

- Validate: question text, answer, type, topics>=1, difficulty, experience level, status.
- Preserve consistency with existing question schema.

## Dependencies

### Requires
- 001-reviewer-role-access-control

### Enables
- 003-update-question-with-version-check

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Duplicate topic values in payload | Normalize/deduplicate topics before persist |
| Extra unknown fields in payload | Ignore or reject per API convention |

## Out of Scope

- Auto-generated content creation
