---
id: 004-self-rating-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 007-devops-interview-bot-ui
implemented: true
---

# Story: 004-self-rating-ui

## User Story

**As an** authenticated user
**I want** to rate how well I answered after seeing the correct answer
**So that** I can honestly track my performance

## Acceptance Criteria

- [ ] **Given** the answer is revealed, **When** the rating widget appears, **Then** I see 5 buttons labeled: 1=Missed it, 2=Partial, 3=Got the gist, 4=Good, 5=Nailed it
- [ ] **Given** I click a rating button, **When** the API responds, **Then** the selected button is highlighted and a "Next Question" button becomes prominent
- [ ] **Given** I don't want to rate, **When** I click "Skip & Next", **Then** I move to the next question without rating
- [ ] **Given** I have rated, **When** I change my mind and click a different rating, **Then** the new rating is submitted (last-write-wins)
- [ ] **Given** the rating API fails, **When** the error occurs, **Then** a toast is shown but the UI stays on the current question

## Technical Notes

- POST /api/v1/sessions/:sessionId/questions/:questionId/rate
- Rating buttons: 5 shadcn Button components in a row, each with label
- Selected state: highlighted with primary color
- "Skip & Next" is a ghost/secondary button
- "Next Question" appears after rating (or after "Skip & Next")

## Dependencies

### Requires
- 003-answer-reveal-ui

### Enables
- Session completion flow (last question → session summary)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Rating on last question | After rating, show session complete screen |

## Out of Scope

- Rating display during active interview (only shown in review)
