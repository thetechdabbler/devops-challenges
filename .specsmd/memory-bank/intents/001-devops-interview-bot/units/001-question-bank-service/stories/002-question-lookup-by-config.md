---
id: 002-question-lookup-by-config
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: draft
priority: must
created: 2026-03-06T00:00:00Z
assigned_bolt: 001-question-bank-service
implemented: false
---

# Story: 002-question-lookup-by-config

## User Story

**As a** interview session service
**I want** to query the question bank by topic, difficulty, experience level, and count
**So that** I can retrieve a matching set of questions to serve in a session

## Acceptance Criteria

- [ ] **Given** active questions exist for a config, **When** I call getQuestionsForSession(topics, difficulty, experience, count), **Then** it returns up to `count` active questions where ANY of the question's topics matches ANY of the session's selected topics
- [ ] **Given** a question has topics=["Docker","Kubernetes"] and the session selects Docker, **When** questions are fetched, **Then** that question is included
- [ ] **Given** fewer questions exist than requested, **When** I call getQuestionsForSession, **Then** it returns all available questions and signals the gap count to the caller
- [ ] **Given** questions are retrieved, **When** the result is assembled, **Then** only questions with status=active are included
- [ ] **Given** multiple topics are selected, **When** questions are retrieved, **Then** questions matching any of the selected topics are included (no double-counting of multi-topic questions)

## Technical Notes

- Implement as `lib/question-bank/queries.ts`
- Query: JOIN questions with question_topics WHERE question_topics.topic IN (...selectedTopics) — use DISTINCT to avoid duplicates from multi-topic questions
- Return type: `{ questions: Question[], gapCount: number }`
- Randomize order of returned questions
- Filter by `status = 'active'` always
- Each Question object includes `topics: string[]` (all its topics, not just the matched one)

## Dependencies

### Requires
- 001-question-schema-and-storage

### Enables
- 003-openai-question-generation (uses gap count to trigger generation)
- 005-question-deduplication (wraps this query)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No questions in bank for config | Returns empty array, gapCount = requested count |
| count > 20 | Clamp to max of 20 |
| count < 5 | Clamp to min of 5 |

## Out of Scope

- Deduplication per user (handled in story 005)
- AI generation (handled in story 003)
