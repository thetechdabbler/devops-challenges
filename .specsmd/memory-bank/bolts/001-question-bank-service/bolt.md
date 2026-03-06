---
id: 001-question-bank-service
unit: 001-question-bank-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
started: 2026-03-06T00:00:00Z
completed: 2026-03-06T00:00:00Z
current_stage: test
stages_completed:
  - name: domain-model
    completed: 2026-03-06T00:00:00Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T00:00:00Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T00:00:00Z
    artifact: adr-001-junction-table-for-multi-topic.md, adr-002-dual-question-types-for-answer-security.md
  - name: implement
    completed: 2026-03-06T00:00:00Z
    artifact: prisma/schema.prisma, src/lib/question-bank/types.ts, src/repositories/question.repository.ts, src/repositories/user-question-history.repository.ts, src/lib/question-bank/dedup.ts, src/services/question-bank.service.ts
  - name: test
    completed: 2026-03-06T00:00:00Z
    artifact: src/__tests__/question.repository.test.ts, src/__tests__/question-bank.service.test.ts
stories:
  - 001-question-schema-and-storage
  - 002-question-lookup-by-config
created: 2026-03-06T00:00:00Z

requires_bolts: []
enables_bolts: [002-question-bank-service, 004-interview-session-service]
requires_units: []
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

## Bolt: 001-question-bank-service

### Objective
Establish the question domain model and core data infrastructure: DB schema, Drizzle ORM setup, and the question lookup API that forms the foundation of the hybrid question bank.

### Stories Included

- [ ] **001-question-schema-and-storage**: Question DB schema with topic/difficulty/type/experience enums, indexes, user_question_history table — Priority: Must
- [ ] **002-question-lookup-by-config**: getQuestionsForSession query with gap detection — Priority: Must

### Expected Outputs
- `db/schema.ts` — questions and user_question_history Drizzle schemas
- `lib/question-bank/queries.ts` — getQuestionsForSession function
- Migration files for questions and user_question_history tables
- Unit tests for query functions

### Dependencies

#### Bolt Dependencies (within intent)
- None (first bolt)

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 002-question-bank-service (needs schema for generation)
- 004-interview-session-service (needs lookup API)
