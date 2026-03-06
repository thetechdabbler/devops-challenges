---
id: 002-session-created-and-persisted
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: draft
priority: must
created: 2026-03-06T00:00:00Z
assigned_bolt: 004-interview-session-service
implemented: false
---

# Story: 002-session-created-and-persisted

## User Story

**As a** system
**I want** to create and persist a session with its assigned questions at the moment it starts
**So that** the session survives page refreshes and is available in history

## Acceptance Criteria

- [ ] **Given** a valid session config is submitted, **When** the session is created, **Then** a session record is written to the DB with status=in-progress and created_at=now
- [ ] **Given** a session is created, **When** questions are fetched from question-bank-service, **Then** session_questions records are written for each question with sequence_order
- [ ] **Given** a session is persisted, **When** the user refreshes the page, **Then** the session and its questions can be retrieved from DB
- [ ] **Given** a session is created, **When** the response is returned, **Then** it includes: session_id, status, question_count, first question

## Technical Notes

- Session creation is atomic: session + session_questions written in a single DB transaction
- Fetch questions from question-bank-service lib (direct call within monolith)
- sequence_order is assigned at creation time (randomized within the fetched set)

## Dependencies

### Requires
- 001-session-configuration

### Enables
- 003-question-delivery-in-sequence

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| question-bank-service returns fewer questions than requested | Session created with available questions, question_count updated to actual |
| DB write fails | Return 500, session not created |

## Out of Scope

- Session completion logic (completed at last question answered)
