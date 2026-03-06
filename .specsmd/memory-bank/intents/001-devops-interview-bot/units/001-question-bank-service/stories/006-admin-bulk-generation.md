---
id: 006-admin-bulk-generation
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: should
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 003-question-bank-service
implemented: true
---

# Story: 006-admin-bulk-generation

## User Story

**As an** admin
**I want** to trigger bulk question generation for a specific topic/difficulty/experience combination
**So that** I can proactively build up the question bank before users need them

## Acceptance Criteria

- [ ] **Given** I am an admin, **When** I POST /api/v1/admin/questions/generate with {topic, difficulty, experience, count}, **Then** OpenAI generates `count` questions and saves them with status=pending_review
- [ ] **Given** bulk generation runs, **When** it completes, **Then** the response includes: questions generated count, questions saved count, any errors
- [ ] **Given** I am not an admin, **When** I call the generate endpoint, **Then** I receive a 403 Forbidden response
- [ ] **Given** OpenAI fails during generation, **When** an error occurs, **Then** partial results are saved and the response indicates how many succeeded

## Technical Notes

- Admin check via JWT role claim (role: 'admin')
- Implement as POST /api/v1/admin/questions/generate
- Limit: max 50 questions per bulk generation request
- Questions saved with status=pending_review (not auto-active)

## Dependencies

### Requires
- 003-openai-question-generation
- 004-generated-question-saved-to-bank

### Enables
- 007-admin-review-approve-reject

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| count > 50 | Clamp to 50, return warning in response |
| OpenAI partial failure | Save successful ones, report errors for failed |

## Out of Scope

- Scheduling / cron-based generation
- Generation progress webhooks
