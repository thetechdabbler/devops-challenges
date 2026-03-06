---
id: 007-self-rating
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 006-interview-session-service
implemented: true
---

# Story: 007-self-rating

## User Story

**As an** authenticated user
**I want** to rate my own answer on a 1-5 scale after revealing the correct answer
**So that** I can track how well I'm performing across topics

## Acceptance Criteria

- [ ] **Given** I have revealed an answer, **When** I POST /api/v1/sessions/:sessionId/questions/:questionId/rate with {rating: 1-5}, **Then** the rating is saved to session_question.self_rating
- [ ] **Given** I submit a rating of 0 or 6, **When** the request is processed, **Then** I receive 400: "Rating must be between 1 and 5"
- [ ] **Given** I skip rating (don't call rate endpoint), **When** the session is reviewed, **Then** self_rating is null for that question
- [ ] **Given** I rate a question, **When** I rate it again with a different value, **Then** the new rating replaces the old one (last-write-wins)
- [ ] **Given** I try to rate before revealing the answer, **When** the request is processed, **Then** I receive 400: "Answer must be revealed before rating"

## Technical Notes

- POST /api/v1/sessions/:sessionId/questions/:questionId/rate
- Body: { rating: number } — validated 1-5
- Check answer_revealed = true before allowing rating
- Rating scale: 1=Missed it, 2=Partial, 3=Got the gist, 4=Good, 5=Nailed it

## Dependencies

### Requires
- 006-answer-reveal

### Enables
- 008-session-history-list (ratings displayed in summary)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Rate question from another user's session | 403 Forbidden |
| Session already completed | Rating still allowed (reviewing past session) |

## Out of Scope

- Aggregate scoring across sessions (v1 shows individual ratings only)
