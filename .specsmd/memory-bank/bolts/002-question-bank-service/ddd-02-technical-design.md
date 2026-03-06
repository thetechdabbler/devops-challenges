---
stage: technical-design
bolt: 002-question-bank-service
created: 2026-03-06T00:00:00Z
---

# Technical Design: AI Question Generation Layer (Bolt 002)

## Architecture Pattern

Modular monolith — extends the existing question-bank module in portal/backend/src/. No new HTTP routes in this bolt.

---

## Layer Structure

```
portal/backend/src/
  lib/question-bank/
    types.ts                     ← extend — add GenerationConfig, GeneratedQuestion, GenerationResult, SaveMode
    ai-generator.ts              ← NEW — OpenAI structured output + response parsing
    dedup.ts                     ← unchanged (complete from Bolt 001)

  services/
    question-bank.service.ts     ← extend — full hybrid flow in getQuestionsForSession

  repositories/
    question.repository.ts       ← extend — saveBatch gains saveMode parameter
```

---

## API Design (internal functions — no new HTTP routes)

### `generate(config)` — AIQuestionGenerator

```typescript
// src/lib/question-bank/ai-generator.ts

async function generate(config: GenerationConfig): Promise<GenerationResult>
```

- Model: `process.env.OPENAI_MODEL ?? 'gpt-4o-mini'`
- Uses OpenAI structured output: `response_format: { type: 'json_schema', json_schema: {...} }`
- One call per invocation — no chunking
- Errors bubble up; service catches and degrades gracefully

### `saveBatch(questions, saveMode)` — extended

```typescript
// src/repositories/question.repository.ts
async function saveBatch(
  questions: GeneratedQuestion[],
  saveMode: SaveMode = 'session'
): Promise<string[]>
```

SaveMode → QuestionStatus mapping:
- `session` → `active`
- `admin`   → `pending_review`

### `getQuestionsForSession` — full hybrid flow

```
1. findByConfig()       → candidates
2. filterUnseen()       → unseen
3. shuffle + take       → taken (up to count)
4. gapCount = count - taken.length
5. if gapCount > 0:
     generate(config, gapCount) → generatedQuestions
     saveBatch(generatedQuestions, 'session') → savedIds
     merge taken + AI questions
6. recordSeen(userId, all ids)
7. return { questions: merged, gapCount: actual shortfall }
```

If OpenAI fails: log error, return bank-only results, set gapCount to actual shortfall.

---

## Data Model

No new Prisma models or migrations. `QuestionStatus.pending_review` already exists. Changes are application-layer only.

---

## Security Design

- `OPENAI_API_KEY` from env only — never logged, never returned to client
- AI questions returned via same `QuestionSummary` projection — ADR-002 maintained
- `pending_review` questions filtered out by `findByConfig` default (status=active) — quarantined until admin approval

---

## NFR Implementation

- **Latency**: OpenAI call only on gap; zero overhead for bank-satisfied sessions
- **Resilience**: OpenAI failure non-fatal — partial results returned with warning log
- **Cost**: count bounded by session config (max 20)

---

## File Checklist

- [ ] `src/lib/question-bank/types.ts` — GenerationConfig, GeneratedQuestion, GenerationResult, SaveMode
- [ ] `src/lib/question-bank/ai-generator.ts` — generate()
- [ ] `src/repositories/question.repository.ts` — saveBatch with saveMode
- [ ] `src/services/question-bank.service.ts` — hybrid flow
- [ ] `src/__tests__/ai-generator.test.ts`
- [ ] `src/__tests__/question-bank.service.test.ts` — updated hybrid flow tests
