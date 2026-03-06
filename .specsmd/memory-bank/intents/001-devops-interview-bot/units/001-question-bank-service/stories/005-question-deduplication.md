---
id: 005-question-deduplication
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 002-question-bank-service
implemented: true
---

# Story: 005-question-deduplication

## User Story

**As an** authenticated user
**I want** to never see the same question twice within 30 days
**So that** my mock interview sessions feel fresh and cover broad ground

## Acceptance Criteria

- [ ] **Given** a user has seen a question in the last 30 days, **When** getUnseenQuestions is called, **Then** that question is excluded from the result set
- [ ] **Given** a question was seen more than 30 days ago, **When** getUnseenQuestions is called, **Then** that question is eligible again
- [ ] **Given** a session is created and questions are served, **When** the session completes, **Then** all served questions are recorded in user_question_history with seen_at = now
- [ ] **Given** all available questions have been seen by a user, **When** dedup is applied, **Then** the function returns an empty set (caller triggers generation)

## Technical Notes

- Implement as `lib/question-bank/dedup.ts`
- Query: filter questions where question.id NOT IN (select question_id from user_question_history where user_id = ? AND seen_at > now() - 30 days)
- Record history in user_question_history at session creation time (not at reveal time)
- Integrate into getQuestionsForSession flow as a wrapper layer

## Dependencies

### Requires
- 001-question-schema-and-storage (user_question_history table)
- 002-question-lookup-by-config

### Enables
- interview-session-service (002-interview-session-service) can now fetch deduplicated questions

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has no history | All questions eligible |
| 30-day boundary (exactly 30 days ago) | Question is eligible (exclusive boundary) |
| Very active user who has exhausted all questions | Returns empty set, triggers AI generation |

## Out of Scope

- Within-session deduplication (handled at session creation — questions fetched once)
