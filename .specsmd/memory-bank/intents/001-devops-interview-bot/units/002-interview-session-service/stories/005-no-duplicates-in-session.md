---
id: 005-no-duplicates-in-session
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 005-interview-session-service
implemented: true
---

# Story: 005-no-duplicates-in-session

## User Story

**As an** authenticated user
**I want** no question to appear more than once in a single session
**So that** my session time is spent on unique challenges

## Acceptance Criteria

- [ ] **Given** a session is created, **When** questions are assigned, **Then** all question IDs in session_questions are unique
- [ ] **Given** the question bank is queried, **When** deduplication runs, **Then** questions seen by this user in the last 30 days are excluded
- [ ] **Given** dedup excludes too many questions, **When** the bank has fewer unique questions than requested, **Then** AI generation fills the gap (with questions the user hasn't seen)

## Technical Notes

- Deduplication is applied in question-bank-service before returning to session service
- Within-session uniqueness is guaranteed by DB constraint (unique on session_id + question_id)
- Cross-session (30-day) dedup is handled by user_question_history table

## Dependencies

### Requires
- 002-session-created-and-persisted
- question-bank-service story 005-question-deduplication

### Enables
- 006-answer-reveal (session questions are trusted to be unique)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has seen all available questions | Session created with re-used questions (30-day window expired) |

## Out of Scope

- Across-session duplicate detection beyond 30 days
