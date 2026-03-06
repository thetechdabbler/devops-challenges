---
id: 008-session-history-list
unit: 002-interview-session-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 006-interview-session-service
implemented: true
---

# Story: 008-session-history-list

## User Story

**As an** authenticated user
**I want** to see a list of my past interview sessions
**So that** I can track my practice history and choose sessions to review

## Acceptance Criteria

- [ ] **Given** I have completed sessions, **When** I GET /api/v1/sessions, **Then** I receive a paginated list of my sessions ordered by created_at desc
- [ ] **Given** the list is returned, **When** I view it, **Then** each session shows: id, created_at, topics, difficulty, experience_level, question_count, status, avg_self_rating (if any rated)
- [ ] **Given** I have no past sessions, **When** I GET /api/v1/sessions, **Then** I receive an empty data array (not an error)
- [ ] **Given** cursor-based pagination, **When** I pass ?cursor=&limit=10, **Then** I receive the correct page and a nextCursor if more exist
- [ ] **Given** sessions from another user exist, **When** I list my sessions, **Then** only my sessions appear

## Technical Notes

- GET /api/v1/sessions?cursor=&limit=20
- JSend response: { status: "success", data: { items: Session[], nextCursor, hasMore } }
- avg_self_rating = average of non-null self_rating values across session_questions
- Order: created_at DESC

## Dependencies

### Requires
- 002-session-created-and-persisted

### Enables
- 009-session-review

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| limit > 100 | Clamp to 100 |
| Invalid cursor | 400 Bad Request |

## Out of Scope

- Session filtering/search
- Sorting by anything other than created_at
