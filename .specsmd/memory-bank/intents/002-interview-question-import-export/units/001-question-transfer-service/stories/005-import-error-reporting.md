---
id: 005-import-error-reporting
unit: 001-question-transfer-service
intent: 002-interview-question-import-export
status: complete
priority: must
created: 2026-03-06T06:46:51.000Z
assigned_bolt: 010-question-transfer-service
implemented: true
---

# Story: 005-import-error-reporting

## User Story

**As an** authenticated user
**I want** detailed import result reporting
**So that** I can fix bad rows and rerun successfully

## Acceptance Criteria

- [ ] **Given** an import run, **When** it completes, **Then** the response includes total, valid, invalid, inserted, duplicate counts.
- [ ] **Given** invalid rows exist, **When** results are returned, **Then** each invalid row includes index and reason.
- [ ] **Given** apply mode, **When** results are returned, **Then** persisted and skipped outcomes are clearly separated.

## Technical Notes

- Keep response schema stable for UI consumption.
- Include sample-capped invalid rows if extremely large.

## Dependencies

### Requires
- 004-import-apply-persistence

### Enables
- 006-import-api-contract

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| 10k+ invalid rows | Return capped row details + aggregate counts |
| Non-UTF8 bytes in file | Validation error with decoding hint |

## Out of Scope

- Downloadable error file artifact
