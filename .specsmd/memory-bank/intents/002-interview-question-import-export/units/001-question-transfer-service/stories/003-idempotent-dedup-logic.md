---
id: 003-idempotent-dedup-logic
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 010-question-transfer-service
implemented: true
---

# Story: 003-idempotent-dedup-logic

## User Story

**As a** system maintainer
**I want** deterministic deduplication during import apply
**So that** repeated imports remain idempotent

## Acceptance Criteria

- [ ] **Given** a normalized import row, **When** dedup key is computed, **Then** logically identical questions produce the same key.
- [ ] **Given** repeated import of the same dataset, **When** apply is run again, **Then** duplicate rows are skipped.
- [ ] **Given** duplicates are skipped, **When** summary is returned, **Then** duplicate count is explicit.

## Technical Notes

- Suggested key parts: normalized text + type + difficulty + experience_level + sorted topics.
- Trim whitespace and normalize casing for deterministic behavior.

## Dependencies

### Requires
- 002-import-dry-run-validation

### Enables
- 004-import-apply-persistence

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Topic order differs in CSV rows | Treated as duplicate after normalization |
| Trailing/leading whitespace | Ignored in dedup key |

## Out of Scope

- Semantic duplicate detection using embeddings
