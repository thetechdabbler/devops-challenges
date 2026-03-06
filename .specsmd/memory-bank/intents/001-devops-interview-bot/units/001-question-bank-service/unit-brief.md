---
unit: 001-question-bank-service
intent: 001-devops-interview-bot
phase: inception
status: complete
created: 2026-03-06T00:00:00.000Z
updated: 2026-03-06T00:00:00.000Z
---

# Unit Brief: Question Bank Service

## Purpose

Owns the DevOps interview question bank — stores, retrieves, and AI-generates questions using OpenAI. Acts as the single source of truth for all questions consumed by the interview session service.

## Scope

### In Scope
- Question entity: storage, indexing by topic/difficulty/type/experience
- Hybrid retrieval: serve from DB bank first, generate via OpenAI for gaps
- Saving AI-generated questions back to the bank
- Deduplication: prevent same question from appearing to same user within 30 days
- Admin interface: trigger bulk generation, review/approve/reject generated questions
- Question bank statistics (count per topic/difficulty/type)

### Out of Scope
- Session lifecycle management (owned by interview-session-service)
- Answer reveal logic (owned by interview-session-service)
- Self-rating (owned by interview-session-service)
- Frontend UI (owned by devops-interview-bot-ui)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Hybrid question bank — DB-first, OpenAI fallback, dedup | Must |
| FR-7 | Admin question management — bulk gen, review, approve/reject, stats | Should |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| Question | A single interview question | id, text, type (theory/scenario), topics[] (array of topic enums), difficulty (1-5), experience_level, source (bank/ai), status (pending_review/active/rejected), created_at |
| QuestionTopic | Junction table for multi-topic support | question_id, topic (enum) |
| Topic | DevOps topic enum | Docker, Kubernetes, CI/CD, Ansible, IaC/Terraform, Observability, AWS, General |
| UserQuestionHistory | Tracks which questions a user has seen | user_id, question_id, seen_at |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| getQuestionsForSession | Fetch questions matching config; fill gaps via OpenAI | topic[], difficulty, experience, count | Question[] |
| generateQuestionsViaAI | Call OpenAI to generate questions for a config | topic, difficulty, experience, count | Question[] (pending_review) |
| saveGeneratedQuestion | Persist AI-generated question to bank | Question data | Saved Question |
| getUnseenQuestions | Filter out questions seen by user in last 30 days | user_id, candidate Question[] | filtered Question[] |
| adminBulkGenerate | Admin triggers generation for a specific config | topic, difficulty, experience, count | Job result |
| reviewQuestion | Admin approves or rejects a pending question | question_id, action | Updated Question |
| getBankStats | Return count breakdown by topic/difficulty/type | - | Stats object |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 5 |
| Should Have | 3 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-question-schema-and-storage | Question schema and storage | Must | Planned |
| 002-question-lookup-by-config | Question lookup by topic/difficulty/experience | Must | Planned |
| 003-openai-question-generation | OpenAI question generation | Must | Planned |
| 004-generated-question-saved-to-bank | Generated questions saved to bank | Must | Planned |
| 005-question-deduplication | Question deduplication per user (30-day window) | Must | Planned |
| 006-admin-bulk-generation | Admin triggers bulk generation | Should | Planned |
| 007-admin-review-approve-reject | Admin reviews and approves/rejects questions | Should | Planned |
| 008-admin-bank-stats | Admin views bank statistics | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| None | Foundation unit |

### Depended By
| Unit | Reason |
|------|--------|
| 002-interview-session-service | Needs question retrieval API |
| 003-devops-interview-bot-ui | Needs admin question management API |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| OpenAI API | Question generation | High — API cost and availability |

---

## Technical Context

### Suggested Technology
- Drizzle ORM with SQLite for question storage
- OpenAI Node.js SDK (`openai` npm package) for generation
- Server-side only — API key via environment variable

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| OpenAI API | External | REST (HTTPS via SDK) |
| interview-session-service | Internal API | Next.js API routes |
| devops-interview-bot-ui | Internal API | Next.js API routes |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Questions | SQLite | Hundreds to thousands | Permanent |
| UserQuestionHistory | SQLite | Per-user seen records | 30-day rolling |

---

## Constraints

- OpenAI API key must never be exposed to the client
- Bulk generation is admin-triggered only (not automatic) to control costs
- Questions referencing concepts from `devops-challenges/` curriculum only

---

## Success Criteria

### Functional
- [ ] Questions are retrievable filtered by topic, difficulty, experience level, and type
- [ ] OpenAI generates questions when bank coverage is insufficient
- [ ] Generated questions are saved and become reusable
- [ ] Users don't see the same question within 30 days
- [ ] Admin can manage the question bank end-to-end

### Non-Functional
- [ ] Question retrieval < 500ms p95
- [ ] OpenAI generation < 5s per question
- [ ] OpenAI key never in client-side code

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 001-question-bank-service | DDD | 001, 002 | Domain model + question storage + lookup |
| 002-question-bank-service | DDD | 003, 004, 005 | OpenAI generation + dedup + bank persistence |
| 003-question-bank-service | DDD | 006, 007, 008 | Admin management + stats |
