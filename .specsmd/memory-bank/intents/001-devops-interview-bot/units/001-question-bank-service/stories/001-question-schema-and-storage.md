---
id: 001-question-schema-and-storage
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: draft
priority: must
created: 2026-03-06T00:00:00Z
assigned_bolt: 001-question-bank-service
implemented: false
---

# Story: 001-question-schema-and-storage

## User Story

**As a** developer building the interview bot
**I want** a well-structured question schema in the database
**So that** questions can be efficiently stored, indexed, and retrieved by topics (multi-topic), difficulty, type, and experience level

## Acceptance Criteria

- [ ] **Given** the app starts, **When** migrations run, **Then** a `questions` table exists with columns: id, text, type (theory|scenario), topics (JSON array of topic enums), difficulty (1-5), experience_level (junior|mid|senior), source (bank|ai), status (pending_review|active|rejected), created_at
- [ ] **Given** a question is inserted with topics=["Docker","Kubernetes"], **When** I query for Docker questions, **Then** this question is included in the results
- [ ] **Given** a question is inserted with topics=["Docker","Kubernetes"], **When** I query for Kubernetes questions, **Then** this question is also included
- [ ] **Given** the schema is created, **When** I insert a question with an invalid type or experience_level, **Then** a constraint error is thrown
- [ ] **Given** the app starts, **When** migrations run, **Then** a `user_question_history` table exists with: id, user_id, question_id, seen_at

## Technical Notes

- Use Drizzle ORM schema definition in `db/schema.ts`
- `topics` stored as JSON array in SQLite (Drizzle `text` column with JSON mode, or separate `question_topics` junction table)
- Recommended: `question_topics` junction table (question_id, topic) for efficient indexed filtering — avoids JSON scanning
- topic enum values: Docker, Kubernetes, CI/CD, Ansible, IaC/Terraform, Observability, AWS, General
- type enum: theory, scenario
- experience_level enum: junior, mid, senior
- Index on question_topics(topic, question_id) for lookup queries
- user_question_history needs index on (user_id, question_id) for dedup queries

## Dependencies

### Requires
- None (foundational story)

### Enables
- 002-question-lookup-by-config
- 003-openai-question-generation

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Duplicate question text for same topic/difficulty | Allow — no unique constraint on text |
| Question with null experience_level | Treated as applicable to all levels |
| Question with single topic in topics array | Valid — topics is always an array, even with one entry |
| Question with all 8 topics | Valid — truly cross-cutting question |

## Out of Scope

- Question generation logic
- Admin review workflow
