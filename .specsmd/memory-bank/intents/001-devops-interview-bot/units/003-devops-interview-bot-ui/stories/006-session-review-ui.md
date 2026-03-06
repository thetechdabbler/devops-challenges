---
id: 006-session-review-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: should
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 008-devops-interview-bot-ui
implemented: true
---

# Story: 006-session-review-ui

## User Story

**As an** authenticated user
**I want** to re-open a past session and browse all its questions, answers, and my ratings
**So that** I can learn from the session and reinforce my knowledge

## Acceptance Criteria

- [ ] **Given** I navigate to /interview/history/:sessionId, **When** the page loads, **Then** I see the session config (topics, difficulty, experience) and all questions in sequence
- [ ] **Given** I view the review page, **When** questions are rendered, **Then** each shows: question text, answer+explanation (always visible in review), my self-rating (or "Not rated")
- [ ] **Given** I view the review page, **When** I see the header, **Then** I see a session summary: total questions, questions revealed, average rating
- [ ] **Given** I click "Start New Session", **When** I click it, **Then** I am navigated to /interview/new

## Technical Notes

- Route: app/(protected)/interview/history/[sessionId]/page.tsx
- Fetch from GET /api/v1/sessions/:id
- All answers shown in review mode (no reveal needed)
- Rating displayed as selected button state (read-only)

## Dependencies

### Requires
- 005-session-history-ui

### Enables
- Users can loop back to setup for a new session

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Session not found | 404 page |
| Session belongs to another user | Redirect to /interview/history |

## Out of Scope

- Re-rating past sessions
- Resuming in-progress sessions from review
