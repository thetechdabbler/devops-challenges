---
id: 004-import-apply-persistence
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 010-question-transfer-service
implemented: true
---

# Story: 004-import-apply-persistence

## User Story

**As an** authenticated user
**I want** apply mode to persist only valid, non-duplicate rows
**So that** question bank data remains clean and safe

## Acceptance Criteria

- [ ] **Given** mode=apply, **When** import executes, **Then** only valid non-duplicate rows are inserted.
- [ ] **Given** invalid rows exist, **When** apply runs, **Then** they are excluded and reported.
- [ ] **Given** persistence occurs, **When** operation completes, **Then** inserted count is returned.

## Technical Notes

- Use transaction chunking for large files.
- Audit imported_by and imported_at metadata.

## Dependencies

### Requires
- 003-idempotent-dedup-logic

### Enables
- 005-import-error-reporting

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| DB conflict on insert | Skip conflicting row and record issue without crashing full run |
| Mid-batch failure | Roll back active chunk and return failure details |

## Out of Scope

- Upsert/overwrite existing questions
