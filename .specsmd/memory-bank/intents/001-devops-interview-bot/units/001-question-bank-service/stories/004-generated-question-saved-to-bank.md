---
id: 004-generated-question-saved-to-bank
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 002-question-bank-service
implemented: true
---

# Story: 004-generated-question-saved-to-bank

## User Story

**As a** system
**I want** AI-generated questions to be saved to the question bank
**So that** they can be reused in future sessions without calling OpenAI again

## Acceptance Criteria

- [ ] **Given** OpenAI generates questions, **When** saveGeneratedQuestion is called, **Then** the question is persisted to the `questions` table with source=ai and status=active
- [ ] **Given** a question is saved, **When** it is queried in future sessions, **Then** it appears in lookup results (status=active)
- [ ] **Given** bulk generation is triggered by admin, **When** questions are generated, **Then** they are saved with status=pending_review (not active) until approved
- [ ] **Given** a session gap-fill generation, **When** questions are generated and saved, **Then** they are immediately active (no review required for session gap-fill)

## Technical Notes

- Two save modes: `session` (auto-active) and `admin` (pending_review)
- Implement in `lib/question-bank/repository.ts`
- Batch insert for efficiency when saving multiple questions

## Dependencies

### Requires
- 001-question-schema-and-storage
- 003-openai-question-generation

### Enables
- 005-question-deduplication
- 006-admin-bulk-generation (admin flow uses pending_review path)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| DB write fails mid-batch | Partial saves OK — no transaction required for gap-fill |
| Duplicate text already in bank | Allow — no unique constraint on question text |

## Out of Scope

- Admin review/approval workflow (story 007)
