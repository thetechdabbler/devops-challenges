---
id: 004-mixed-question-types
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 005-interview-session-service
implemented: true
---

# Story: 004-mixed-question-types

## User Story

**As an** authenticated user
**I want** my session to contain a mix of theory and scenario-based questions
**So that** my interview preparation covers both conceptual knowledge and practical thinking

## Acceptance Criteria

- [ ] **Given** a session is created with 10 questions, **When** questions are assembled, **Then** at least 3 are theory type and at least 3 are scenario type
- [ ] **Given** the question bank has insufficient scenario questions for the config, **When** questions are assembled, **Then** OpenAI generates the missing scenario questions to meet the minimum
- [ ] **Given** a session of 5 questions (minimum), **When** questions are assembled, **Then** at least 2 are theory and at least 2 are scenario (1 can be either)
- [ ] **Given** questions are fetched, **When** the mix constraint is applied, **Then** the constraint is enforced in getQuestionsForSession before returning to the session service

## Technical Notes

- Mix enforcement: floor(count * 0.30) minimum per type
- Minimum 5 session: at least 2 theory, 2 scenario, 1 free
- Implement mix validation in question-bank-service `getQuestionsForSession`
- If mix cannot be satisfied from bank, trigger targeted AI generation per type

## Dependencies

### Requires
- 002-session-created-and-persisted

### Enables
- Full session quality assurance

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| OpenAI also can't fill mix gap | Create session with available questions, warn caller |
| All questions from bank are same type | Trigger generation for the missing type |

## Out of Scope

- User-configurable type ratios (fixed 30/30 split in v1)
