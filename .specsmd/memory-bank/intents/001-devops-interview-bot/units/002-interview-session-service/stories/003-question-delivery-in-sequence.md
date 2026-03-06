---
id: 003-question-delivery-in-sequence
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: draft
priority: must
created: 2026-03-06T00:00:00Z
assigned_bolt: 004-interview-session-service
implemented: false
---

# Story: 003-question-delivery-in-sequence

## User Story

**As an** authenticated user
**I want** questions delivered to me one at a time in sequence
**So that** the interview feels structured and progressive

## Acceptance Criteria

- [ ] **Given** an active session, **When** I GET /api/v1/sessions/:id/questions/current, **Then** I receive the current question (lowest sequence_order not yet completed)
- [ ] **Given** I request the current question, **When** the response is returned, **Then** it includes: question text, type, topic, difficulty — but NOT the answer
- [ ] **Given** I am on question 3 of 10, **When** I call current, **Then** I receive question 3 (not 1 or 4)
- [ ] **Given** all questions have been answered/skipped, **When** I request current, **Then** the API returns status=completed and no question

## Technical Notes

- GET /api/v1/sessions/:id/questions/current
- "Current" = lowest sequence_order where answer_revealed = false, OR first question if none revealed yet
- Never include answer or explanation in the question delivery response

## Dependencies

### Requires
- 002-session-created-and-persisted

### Enables
- 006-answer-reveal (needs current question context)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Session belongs to another user | 403 Forbidden |
| Session not found | 404 Not Found |

## Out of Scope

- Navigation backwards (v1 is forward-only)
- Skipping questions
