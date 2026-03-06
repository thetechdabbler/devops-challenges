---
stage: design
bolt: 004-interview-session-service
created: 2026-03-06T00:00:00Z
---

## Technical Design: Interview Session Service (Core)

### Architecture Pattern

Layered architecture consistent with existing portal: Routes → Controller → Service → Repository → Prisma.
Session data lives in the same PostgreSQL database as the question bank. No cross-service HTTP calls — questionBankService is imported directly within the monolith.

### Layer Structure

```
┌──────────────────────────────────────────┐
│  Presentation (Routes + Controller)       │  Express router, JSend responses
│  POST /api/v1/sessions                    │
│  GET  /api/v1/sessions/:id/questions/current │
├──────────────────────────────────────────┤
│  Application (Service)                    │  createSession, getCurrentQuestion
│  session.service.ts                       │  orchestrates validation + repo + qbank
├──────────────────────────────────────────┤
│  Domain (types + validator)               │  SessionConfig, CurrentQuestionResult
│  lib/session/types.ts                     │  Zod schema
├──────────────────────────────────────────┤
│  Infrastructure (Repository + Prisma)     │  session.repository.ts
│  Prisma transactions for atomic writes   │
└──────────────────────────────────────────┘
```

### API Design

**POST /api/v1/sessions** — Create session
- Auth: authenticate middleware (JWT cookie)
- Request: `{ topics: string[], difficulty: 1-5, experience_level: junior|mid|senior, question_count: 5-20 }`
- Response 201: `{ status: 'success', data: { session_id, status, question_count, gap_count?, current_question: { sequence_order, total_count, question: QuestionSummary } } }`
- Response 400: validation failure
- Response 401: unauthenticated

**GET /api/v1/sessions/:id/questions/current** — Fetch current question
- Auth: authenticate middleware
- Response 200 active: `{ status: 'success', data: { session_status: 'in_progress', sequence_order, total_count, question: QuestionSummary } }`
- Response 200 complete: `{ status: 'success', data: { session_status: 'completed', question: null } }`
- Response 403: session belongs to another user
- Response 404: session not found

### Data Model

New Prisma models in `portal/backend/prisma/schema.prisma`:

```prisma
enum SessionStatus { in_progress  completed }

model Session {
  id                String            @id @default(uuid())
  user_id           Int
  topics            Topic[]
  difficulty        Int
  experience_level  ExperienceLevel
  question_count    Int
  status            SessionStatus     @default(in_progress)
  created_at        DateTime          @default(now())
  completed_at      DateTime?
  user              User              @relation(fields: [user_id], references: [id])
  session_questions SessionQuestion[]
}

model SessionQuestion {
  id              String    @id @default(uuid())
  session_id      String
  question_id     String
  sequence_order  Int
  answer_revealed Boolean   @default(false)
  self_rating     Int?
  revealed_at     DateTime?
  session         Session   @relation(fields: [session_id], references: [id])
  question        Question  @relation(fields: [question_id], references: [id])

  @@unique([session_id, sequence_order])
  @@unique([session_id, question_id])
}
```

User model gains: `sessions Session[]`
Question model gains: `session_questions SessionQuestion[]`

### File Structure

```
portal/backend/src/
├── lib/session/
│   └── types.ts                    — SessionConfig, CurrentQuestionResult
├── repositories/
│   └── session.repository.ts       — create (tx), findById, findCurrentQuestion
├── services/
│   └── session.service.ts          — createSession, getCurrentQuestion
├── controllers/
│   └── session.controller.ts       — create, getCurrentQuestion handlers
├── routes/
│   └── session.routes.ts           — router with authenticate middleware
└── __tests__/
    ├── session.service.test.ts
    └── session.controller.test.ts
```

`src/index.ts` gains: `app.use('/api/v1/sessions', sessionRouter)`

### Security Design

- **Ownership enforcement**: All repository queries scope by user_id; mismatch returns 403, not-found returns 404
- **Answer boundary**: getCurrentQuestion selects only QuestionSummary fields — answer/explanation never included (ADR-002)
- **Auth**: All session routes behind authenticate middleware
- **Input validation**: Zod schema; Topic enum validated against Prisma Topic enum; difficulty 1-5; question_count 5-20

### NFR Implementation

- **Session creation < 500ms p95**: questionBankService call is dominant cost; Prisma transaction for session+questions write is O(question_count) inserts, expected < 50ms
- **gapCount handling (ADR-004)**: session created with actual question count if gapCount > 0; gap_count surfaced in POST response
- **Answer safety**: QuestionSummary shape enforced at Prisma select level — no TypeScript casting needed
