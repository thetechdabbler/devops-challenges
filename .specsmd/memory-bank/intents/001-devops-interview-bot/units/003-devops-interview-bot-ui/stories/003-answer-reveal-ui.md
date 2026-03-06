---
id: 003-answer-reveal-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 007-devops-interview-bot-ui
implemented: true
---

# Story: 003-answer-reveal-ui

## User Story

**As an** authenticated user
**I want** to reveal the answer to the current question with a single click
**So that** I can compare my answer against the correct one

## Acceptance Criteria

- [ ] **Given** I am viewing a question, **When** I click "Reveal Answer", **Then** the answer and explanation animate into view below the question
- [ ] **Given** the answer is revealed, **When** I view the content, **Then** I see: answer text, explanation paragraph, and key concepts list
- [ ] **Given** "Reveal Answer" is clicked, **When** the API responds, **Then** the button changes to a disabled "Answer Revealed" state
- [ ] **Given** the answer is revealed, **When** I view the page, **Then** the self-rating widget appears below the answer
- [ ] **Given** the API call fails, **When** reveal is clicked, **Then** a toast error is shown and the button resets

## Technical Notes

- POST /api/v1/sessions/:sessionId/questions/:questionId/reveal
- Use a fade-in animation (Tailwind transition classes) for the answer section
- Answer section: Card component with Answer header, explanation body, key concepts as Badge list
- After reveal: show "Reveal Answer" → "Answer Revealed ✓" (disabled)

## Dependencies

### Requires
- 002-interview-question-ui

### Enables
- 004-self-rating-ui

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Page refreshed after reveal | Answer section visible on reload (answer_revealed=true in API) |

## Out of Scope

- Collapsing/hiding the answer after reveal
