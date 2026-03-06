---
id: 008-admin-bank-stats
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: should
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 003-question-bank-service
implemented: true
---

# Story: 008-admin-bank-stats

## User Story

**As an** admin
**I want** to see statistics about the question bank
**So that** I can identify gaps and decide where to trigger more generation

## Acceptance Criteria

- [ ] **Given** I am an admin, **When** I GET /api/v1/admin/questions/stats, **Then** I receive counts broken down by topic, difficulty, type (theory/scenario), and status (active/pending_review/rejected)
- [ ] **Given** the stats are returned, **When** I view them, **Then** I can see how many active questions exist per topic+difficulty combination
- [ ] **Given** I am not an admin, **When** I call /api/v1/admin/questions/stats, **Then** I receive 403 Forbidden

## Technical Notes

- Single SQL aggregation query with GROUP BY topic, difficulty, type, status
- Response structure: `{ byTopic: {...}, byDifficulty: {...}, byType: {...}, pendingReview: number }`
- Implement in lib/question-bank/stats.ts

## Dependencies

### Requires
- 001-question-schema-and-storage
- 007-admin-review-approve-reject (stats show pending_review count)

### Enables
- Admin UI (003-devops-interview-bot-ui story 007)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty bank | Returns all zeros |
| Mixed statuses | All statuses included in counts |

## Out of Scope

- Per-user stats
- Time-series / historical stats
