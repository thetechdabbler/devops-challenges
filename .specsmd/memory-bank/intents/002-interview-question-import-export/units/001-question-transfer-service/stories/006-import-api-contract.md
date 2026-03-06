---
id: 006-import-api-contract
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 010-question-transfer-service
implemented: true
---

# Story: 006-import-api-contract

## User Story

**As a** frontend engineer
**I want** clear import/export API contracts
**So that** UI integration is predictable and robust

## Acceptance Criteria

- [ ] **Given** API docs/types, **When** frontend integrates, **Then** request/response contracts are explicit for export and import.
- [ ] **Given** import modes, **When** API is called, **Then** mode behavior differences are documented.
- [ ] **Given** validation failures, **When** API responds, **Then** error structure is stable and typed.

## Technical Notes

- Include endpoint shapes and status codes.
- Align with existing API response conventions.

## Dependencies

### Requires
- 005-import-error-reporting

### Enables
- 001-import-export-module-entry

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unknown mode provided | 400 with supported values |
| Missing multipart file | 400 with field-level message |

## Out of Scope

- Public API versioning changes
