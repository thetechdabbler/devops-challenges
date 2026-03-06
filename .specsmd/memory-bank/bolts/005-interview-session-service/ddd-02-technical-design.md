---
stage: design
bolt: 005-interview-session-service
created: 2026-03-06T00:00:00Z
---

## Technical Design: Interview Session Service — Quality Constraints + Answer Reveal

### Architecture Pattern

Same layered pattern as bolt 004. Two areas of change:
1. Enhancement to `question-bank.service.ts`: mix enforcement + type-targeted AI gap-fill
2. New reveal flow: repository method + service method + controller handler + route

### Layer Structure

```
┌───────────────────────────────────────────────────────────┐
│  Presentation                                              │
│  POST /api/v1/sessions/:sessionId/questions/:qId/reveal   │
├───────────────────────────────────────────────────────────┤
│  Application (Service)                                     │
│  interviewSessionService.revealAnswer(...)                 │
│  questionBankService.getQuestionsForSession (enhanced)     │
├───────────────────────────────────────────────────────────┤
│  Domain                                                    │
│  enforceMix() — pure function in lib/question-bank/mix.ts  │
├───────────────────────────────────────────────────────────┤
│  Infrastructure                                            │
│  interviewSessionRepository.revealQuestion()               │
│  interviewSessionRepository.completeSession()              │
│  questionRepository.findById() (existing — full shape)     │
└───────────────────────────────────────────────────────────┘
```

### API Design

**POST /api/v1/sessions/:sessionId/questions/:questionId/reveal**
- Auth: authenticate middleware
- No request body
- Response 200: `{ status: 'success', data: { question_id, answer, explanation, key_concepts, session_status } }`
- Response 403: session belongs to another user
- Response 404: session not found OR question not in session

### Mix Enforcement Design

**Location**: `src/lib/question-bank/mix.ts` — pure helper

```typescript
const MIN_PER_TYPE = (count: number) => Math.max(2, Math.floor(count * 0.30))
enforceMix(questions: QuestionSummary[], count: number) → { theoryGap: number, scenarioGap: number }
```

Enhanced `getQuestionsForSession` flow:
1. Bank query + dedup (existing)
2. Shuffle + take up to count (existing)
3. enforceMix → compute gap per type
4a. If theoryGap > 0: AI generate theory questions (non-fatal — ADR-004)
4b. If scenarioGap > 0: AI generate scenario questions (non-fatal — ADR-004)
5. Save generated, merge, re-check (best-effort)
6. recordSeen, return { questions, gapCount }

`GenerationConfig` gains optional `type?: QuestionType` to scope AI generation per type.

### Dedup (Story 005)

No new code. Already satisfied by:
- Cross-session 30-day dedup: `filterUnseen` in `getQuestionsForSession` (bolt 002)
- Within-session uniqueness: `@@unique([session_id, question_id])` constraint (bolt 004)

This bolt adds service-level tests confirming the integration.

### Answer Reveal Design

New types in `lib/session/types.ts`:
```typescript
type RevealResult = {
  questionId: string
  answer: string
  explanation: string
  keyConcepts: string[]
  sessionStatus: 'in_progress' | 'completed'
}
```

New `interviewSessionRepository` methods:
- `revealQuestion(sessionId, questionId) → { questionId, alreadyRevealed } | null`
- `completeSession(sessionId) → void`
- `countUnrevealed(sessionId) → number`

`interviewSessionService.revealAnswer` flow:
1. findById → 404/403
2. revealQuestion → 404 if not in session
3. questionRepository.findById → full Question (ADR-002 boundary)
4. countUnrevealed → if 0, completeSession (session auto-completes on last reveal)
5. Return RevealResult

### Security Design

- Ownership before reveal: findById → 403 if user mismatch; question-not-in-session → 404
- ADR-002 boundary: full Question only fetched after ownership + membership verified
- Idempotent: repeat reveal returns same data, no error

### NFR

- Reveal latency: 2 DB reads + 1 update + 1 full fetch + optional completion — expected < 100ms
- Mix enforcement: up to 2 AI calls per session creation (non-fatal) — adds ~2-4s to p95 when triggered
