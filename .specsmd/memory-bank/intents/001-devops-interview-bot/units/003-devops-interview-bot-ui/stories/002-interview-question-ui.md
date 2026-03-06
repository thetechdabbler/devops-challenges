---
id: 002-interview-question-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 007-devops-interview-bot-ui
implemented: true
---

# Story: 002-interview-question-ui

## User Story

**As an** authenticated user
**I want** to see one question at a time during my interview session
**So that** I can focus on answering each question without distraction

## Acceptance Criteria

- [ ] **Given** I am on /interview/:sessionId, **When** the page loads, **Then** the current question text, topic badge, and type (Theory/Scenario) are displayed
- [ ] **Given** the question is loaded, **When** I view the page, **Then** a progress indicator shows "Question N of Total" (e.g., "Question 3 of 10")
- [ ] **Given** I am viewing question N, **When** I have revealed the answer and click "Next Question", **Then** the next question in sequence is loaded
- [ ] **Given** all questions are complete, **When** I finish the last one, **Then** I see a session summary screen with option to view history
- [ ] **Given** the question is loading, **When** the API call is in-flight, **Then** a skeleton loader is shown in place of the question

## Technical Notes

- Route: app/(protected)/interview/[sessionId]/page.tsx
- Fetch from GET /api/v1/sessions/:id/questions/current
- Topic displayed as a shadcn Badge (colored by topic)
- Type displayed as a secondary badge: Theory | Scenario

## Dependencies

### Requires
- 001-session-setup-ui

### Enables
- 003-answer-reveal-ui

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid sessionId in URL | 404 page |
| Session belongs to another user | Redirect to /interview |

## Out of Scope

- Backwards navigation
- Timer per question
