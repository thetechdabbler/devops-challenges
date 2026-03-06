---
id: 002-question-bank-service
unit: 001-question-bank-service
intent: 001-devops-interview-bot
type: ddd-construction-bolt
status: complete
started: 2026-03-06T00:00:00.000Z
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-06T00:00:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-03-06T00:00:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-06T00:00:00.000Z
    artifact: adr-003-openai-structured-output.md, adr-004-non-fatal-ai-degradation.md
  - name: implement
    completed: 2026-03-06T00:00:00.000Z
    artifact: src/lib/question-bank/types.ts, src/lib/question-bank/ai-generator.ts, src/repositories/question.repository.ts, src/services/question-bank.service.ts
stories:
  - 003-openai-question-generation
  - 004-generated-question-saved-to-bank
  - 005-question-deduplication
created: 2026-03-06T00:00:00.000Z
requires_bolts:
  - 001-question-bank-service
enables_bolts:
  - 003-question-bank-service
  - 004-interview-session-service
requires_units: []
blocks: true
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
completed: "2026-03-06T03:06:53Z"
---

## Bolt: 002-question-bank-service

### Objective
Implement the hybrid question generation layer: OpenAI integration, question persistence, and user-level deduplication. This bolt makes the question bank truly hybrid — served from DB or generated on-demand.

### Stories Included

- [ ] **003-openai-question-generation**: OpenAI SDK integration, structured prompt, parseable JSON response — Priority: Must
- [ ] **004-generated-question-saved-to-bank**: Persist AI questions to DB (session mode = active, admin mode = pending_review) — Priority: Must
- [ ] **005-question-deduplication**: Filter questions seen by user within 30 days via user_question_history — Priority: Must

### Expected Outputs
- `lib/question-bank/ai-generator.ts` — OpenAI generation function
- `lib/question-bank/repository.ts` — saveGeneratedQuestion (batch insert)
- `lib/question-bank/dedup.ts` — getUnseenQuestions filter
- Updated `lib/question-bank/queries.ts` — getQuestionsForSession now includes dedup + generation fallback
- Integration tests for generation + dedup pipeline

### Dependencies

#### Bolt Dependencies (within intent)
- **001-question-bank-service** (Required): Needs schema and lookup query

#### Unit Dependencies (cross-unit)
- None

#### Enables (other bolts waiting on this)
- 003-question-bank-service (admin features need generation to work)
- 004-interview-session-service (session creation needs full hybrid flow)
