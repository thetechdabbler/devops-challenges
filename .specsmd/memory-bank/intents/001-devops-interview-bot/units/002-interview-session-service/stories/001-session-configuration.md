---
id: 001-session-configuration
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: draft
priority: must
created: 2026-03-06T00:00:00Z
assigned_bolt: 004-interview-session-service
implemented: false
---

# Story: 001-session-configuration

## User Story

**As an** authenticated user
**I want** to configure an interview session with topics, difficulty, experience level, and question count
**So that** the session is tailored to my preparation needs

## Acceptance Criteria

- [ ] **Given** I am authenticated, **When** I POST /api/v1/sessions with valid config, **Then** a session is created and its ID is returned
- [ ] **Given** I submit a config with no topics selected, **When** the request is processed, **Then** I receive a 400 error: "At least one topic is required"
- [ ] **Given** I submit a config with question_count < 5 or > 20, **When** validated, **Then** I receive a 400 error with the constraint message
- [ ] **Given** I submit a valid config, **When** the session is created, **Then** the config (topics, difficulty, experience, question_count) is persisted on the session record

## Technical Notes

- POST /api/v1/sessions body: { topics: string[], difficulty: 1-5, experience_level: junior|mid|senior, question_count: 5-20 }
- Validate using Zod schema before processing
- Session schema in db/schema.ts with Drizzle

## Dependencies

### Requires
- None (first story in unit)

### Enables
- 002-session-created-and-persisted

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid topic value | 400 error: "Invalid topic: {value}" |
| Unauthenticated request | 401 Unauthorized |

## Out of Scope

- Question fetching (story 002)
- Question delivery (story 003)
