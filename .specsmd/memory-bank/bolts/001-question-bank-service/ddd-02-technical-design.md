---
stage: technical-design
bolt: 001-question-bank-service
created: 2026-03-06T00:00:00Z
updated: 2026-03-06T00:00:00Z
stack_note: Originally designed for Next.js + Drizzle + SQLite. Updated 2026-03-06 to target existing portal stack (Express + Prisma + PostgreSQL).
---

# Technical Design: question-bank-service (Bolt 001)

## Architecture Pattern

**Modular Monolith — Domain Module inside existing Express portal**

The question-bank-service is a domain module within `portal/backend/`, following the existing layered pattern: repository → service → controller → route. It mirrors how progress, sessions, and notes are implemented.

---

## Layer Structure

```
portal/backend/src/
  repositories/
    question.repository.ts      ← DB access: findByConfig, findById, saveBatch
    user-question-history.ts    ← DB access: findRecent, recordSeen

  services/
    question-bank.service.ts    ← getQuestionsForSession (orchestration)

  controllers/
    question-bank.controller.ts ← HTTP handlers (future bolt — stub only in Bolt 001)

  routes/
    question-bank.routes.ts     ← Route registration (registered in index.ts)

  lib/question-bank/
    types.ts                    ← Domain types (Topic, QuestionType, etc.)
    dedup.ts                    ← filterUnseen helper
```

**Prisma schema additions** go in `portal/backend/prisma/schema.prisma`.

**Scope of Bolt 001** (stories 001 + 002):
- `prisma/schema.prisma` — Question, QuestionTopic, UserQuestionHistory models
- `src/lib/question-bank/types.ts` — all type definitions
- `src/repositories/question.repository.ts` — findByConfig, findById
- `src/repositories/user-question-history.repository.ts` — findRecent, recordSeen
- `src/lib/question-bank/dedup.ts` — filterUnseen
- `src/services/question-bank.service.ts` — getQuestionsForSession

---

## Database Schema (Prisma + PostgreSQL)

### `Question` model

```prisma
enum QuestionType {
  theory
  scenario
}

enum ExperienceLevel {
  junior
  mid
  senior
}

enum QuestionSource {
  bank
  ai
}

enum QuestionStatus {
  pending_review
  active
  rejected
}

model Question {
  id               String              @id @default(uuid())
  text             String
  type             QuestionType
  difficulty       Int                 // 1–5
  experience_level ExperienceLevel
  source           QuestionSource
  status           QuestionStatus      @default(active)
  answer           String
  explanation      String
  key_concepts     String[]            @default([])
  created_at       DateTime            @default(now())

  topics           QuestionTopic[]
  history          UserQuestionHistory[]

  @@index([status])
  @@index([difficulty])
  @@index([status, difficulty, experience_level])
}
```

### `QuestionTopic` model (junction — multi-topic support per ADR-001)

```prisma
enum Topic {
  Docker
  Kubernetes
  CI_CD        @map("CI/CD")
  Ansible
  IaC_Terraform @map("IaC/Terraform")
  Observability
  AWS
  General
}

model QuestionTopic {
  question_id  String
  topic        Topic

  question     Question @relation(fields: [question_id], references: [id], onDelete: Cascade)

  @@id([question_id, topic])
  @@index([topic])
}
```

### `UserQuestionHistory` model

```prisma
model UserQuestionHistory {
  id          String   @id @default(uuid())
  user_id     Int
  question_id String
  seen_at     DateTime @default(now())

  question    Question @relation(fields: [question_id], references: [id])
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([user_id, question_id])
}
```

---

## API Contracts (Bolt 001 scope — internal lib functions)

Bolt 001 delivers the internal service layer. HTTP endpoints are wired in Bolt 003.

### `getQuestionsForSession`

```typescript
// src/services/question-bank.service.ts

type SessionConfig = {
  topics: Topic[];
  difficulty: number;          // 1–5
  experienceLevel: ExperienceLevel;
  count: number;               // 5–20
};

type QuestionFetchResult = {
  questions: QuestionSummary[];
  gapCount: number;            // 0 = bank satisfied request fully
};

async function getQuestionsForSession(
  config: SessionConfig,
  userId: number
): Promise<QuestionFetchResult>
```

**Algorithm**:
1. `findByConfig(config.topics, config.difficulty, config.experienceLevel)` → candidates
2. `filterUnseen(userId, candidates)` → unseenCandidates
3. Shuffle unseenCandidates, take `config.count`
4. `gapCount = Math.max(0, config.count - unseenCandidates.length)`
5. Return `{ questions: taken, gapCount }`

### `findByConfig` (questionRepository)

```typescript
async function findByConfig(
  topics: Topic[],
  difficulty: number,
  experienceLevel: ExperienceLevel,
  status: QuestionStatus = 'active'
): Promise<QuestionSummary[]>
```

**SQL strategy** (via Prisma raw query for DISTINCT JOIN):
```sql
SELECT DISTINCT q.id, q.text, q.type, q.difficulty,
       q.experience_level, q.source, q.status, q.created_at
FROM "Question" q
JOIN "QuestionTopic" qt ON qt.question_id = q.id
WHERE qt.topic = ANY(:topics)
  AND q.difficulty = :difficulty
  AND q.experience_level = :experienceLevel
  AND q.status = :status
ORDER BY RANDOM()
```

DISTINCT prevents duplicate rows when a question matches multiple selected topics (ADR-001).
Returns `QuestionSummary[]` — no answer/explanation fields (ADR-002).

### `filterUnseen`

```typescript
// src/lib/question-bank/dedup.ts
async function filterUnseen(
  userId: number,
  candidates: QuestionSummary[]
): Promise<QuestionSummary[]>
```

Queries `UserQuestionHistory` where `user_id = userId AND seen_at > 30 days ago`.
Returns candidates whose `id` is NOT in the seen set.

### `recordSeen`

```typescript
async function recordSeen(userId: number, questionIds: string[]): Promise<void>
```

Batch inserts into `UserQuestionHistory`. Called by session service after questions are assigned.

---

## Security Design

- **No sensitive data in responses**: `findByConfig` returns `QuestionSummary` — no `answer`, `explanation`, or `key_concepts`. Consistent with ADR-002.
- **Full Question** (with answer) returned only by `findById` — used exclusively by the reveal endpoint (Bolt 005).
- **Auth**: All question-bank routes protected by existing `authenticate` middleware.
- **Admin endpoints** (Bolt 003): Additional role check enforced in controller.

```typescript
// QuestionSummary — safe for session delivery (ADR-002)
type QuestionSummary = {
  id: string;
  text: string;
  type: QuestionType;
  topics: Topic[];
  difficulty: number;
  experienceLevel: ExperienceLevel;
  source: QuestionSource;
  status: QuestionStatus;
  createdAt: Date;
};

// Question — full, used only in reveal flow
type Question = QuestionSummary & {
  answer: string;
  explanation: string;
  keyConcepts: string[];
};
```

---

## NFR Implementation

### Performance (< 500ms p95)
- Composite index `(status, difficulty, experience_level)` on `Question`
- Index on `QuestionTopic(topic)` covers the JOIN filter
- `RANDOM()` ordering acceptable for hundreds–low thousands of questions
- `filterUnseen` runs a single IN query, not N+1

### Data Integrity
- `QuestionTopic` composite PK `(question_id, topic)` prevents duplicates
- `onDelete: Cascade` from `Question` → `QuestionTopic`
- `UserQuestionHistory` FK to both `User` and `Question`

---

## File Checklist (Bolt 001 deliverables)

- [ ] `prisma/schema.prisma` — add Question, QuestionTopic, UserQuestionHistory, Topic enum
- [ ] Migration via `prisma migrate dev --name add-question-bank`
- [ ] `src/lib/question-bank/types.ts` — Topic, QuestionType, ExperienceLevel, QuestionSource, QuestionStatus, SessionConfig, QuestionFetchResult, QuestionSummary, Question
- [ ] `src/repositories/question.repository.ts` — findByConfig, findById
- [ ] `src/repositories/user-question-history.repository.ts` — findRecent, recordSeen
- [ ] `src/lib/question-bank/dedup.ts` — filterUnseen
- [ ] `src/services/question-bank.service.ts` — getQuestionsForSession
- [ ] `src/__tests__/question.repository.test.ts`
- [ ] `src/__tests__/question-bank.service.test.ts`
