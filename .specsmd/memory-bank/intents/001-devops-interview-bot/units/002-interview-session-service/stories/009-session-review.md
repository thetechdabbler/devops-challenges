---
id: 009-session-review
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 006-interview-session-service
implemented: true
---

# Story: 009-session-review

## User Story

**As an** authenticated user
**I want** to re-open a past session and review all its questions, answers, and my ratings
**So that** I can learn from previous sessions and track my improvement

## Acceptance Criteria

- [ ] **Given** a completed session, **When** I GET /api/v1/sessions/:id, **Then** I receive the full session with all session_questions including: question text, type, topic, answer (if revealed), self_rating
- [ ] **Given** a question was not revealed during the session, **When** I view the session detail, **Then** the answer is still accessible (reveal is always available in review mode)
- [ ] **Given** I request a session that belongs to another user, **When** the request is processed, **Then** I receive 403 Forbidden
- [ ] **Given** I request a session that doesn't exist, **When** the request is processed, **Then** I receive 404 Not Found

## Technical Notes

- GET /api/v1/sessions/:id
- Returns full session + all session_questions joined with question data
- In review mode, always return answer+explanation (not gated by answer_revealed)
- session_questions ordered by sequence_order ASC

## Dependencies

### Requires
- 008-session-history-list

### Enables
- Frontend session review UI

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| In-progress session | Still viewable — shows progress so far |
| Session with 0 questions revealed | Returns all questions with answers in review mode |

## Out of Scope

- Resuming an in-progress session from review (v1: review is read-only)
