---
id: 006-answer-reveal
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 005-interview-session-service
implemented: true
---

# Story: 006-answer-reveal

## User Story

**As an** authenticated user
**I want** to reveal the answer to a question on demand
**So that** I can compare my thinking against the correct answer and explanation

## Acceptance Criteria

- [ ] **Given** I am on a question, **When** I POST /api/v1/sessions/:sessionId/questions/:questionId/reveal, **Then** the answer and explanation are returned
- [ ] **Given** an answer is revealed, **When** the response is returned, **Then** it includes: answer text, explanation, and key concepts covered
- [ ] **Given** an answer is revealed, **When** the session_question record is updated, **Then** answer_revealed = true
- [ ] **Given** I reveal an answer twice, **When** the second reveal request is made, **Then** the answer is returned again (idempotent) without error
- [ ] **Given** the question belongs to a different user's session, **When** reveal is requested, **Then** 403 Forbidden is returned

## Technical Notes

- POST /api/v1/sessions/:sessionId/questions/:questionId/reveal
- Answer and explanation are stored on the Question record (from question-bank-service)
- Update session_question.answer_revealed = true
- Mark question progress — revealed questions are "done" from a session flow perspective

## Dependencies

### Requires
- 003-question-delivery-in-sequence

### Enables
- 007-self-rating

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Session is completed | Still allow reveal for review purposes |
| question_id not in this session | 404 Not Found |

## Out of Scope

- AI-generated feedback on user's answer
