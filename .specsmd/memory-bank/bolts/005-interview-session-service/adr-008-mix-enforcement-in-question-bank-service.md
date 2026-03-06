---
bolt: 005-interview-session-service
created: 2026-03-06T00:00:00Z
status: accepted
---

# ADR-008: Mix Enforcement Owned by question-bank-service

## Context

Session creation requires at least 30% theory and 30% scenario questions (≥ max(2, floor(count × 0.30)) per type). This constraint must be enforced somewhere in the stack. The two natural candidates are: inside `interviewSessionService.createSession`, or inside `questionBankService.getQuestionsForSession`.

## Decision

Mix enforcement lives inside `questionBankService.getQuestionsForSession`. The function guarantees best-effort type distribution for all callers. The constraint is not session-specific — it's a quality rule of the question bank delivery contract.

## Rationale

The question bank owns question quality and selection. Mix enforcement is a selection-quality concern, not a session-flow concern. Placing it in the session service would couple session logic to question type knowledge and require duplication if a second caller of `getQuestionsForSession` is added. The bank service already performs dedup and AI gap-fill; type-balance is another dimension of the same "deliver a high-quality question set" responsibility.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Enforce in session service | Simple — session controls its own shape | Couples session to question type knowledge; duplicated for each caller | Violates bounded context — bank should control delivery quality |
| Post-creation validation (reject session if mix wrong) | Guarantees constraint or fails explicitly | Poor UX — user must retry with different config | No user control over type distribution; arbitrary failure |
| Separate mix-enforcement endpoint | Clean separation | Added roundtrip; complex orchestration | Over-engineering for a single constraint |

## Consequences

### Positive

- All future callers of `getQuestionsForSession` automatically receive mix-balanced results
- Session service has no knowledge of question types
- Mix constraint is testable in isolation within the question-bank-service test suite

### Negative

- `getQuestionsForSession` may now make up to 2 additional AI calls per invocation (one per type gap)
- Session creation p95 latency increases when type gaps exist (AI calls are ~1-2s each)

### Risks

- **AI fills gap with wrong type**: mitigated by passing `type` to `GenerationConfig`; prompt instructs model to generate that specific type
- **Both type gaps fail**: session created with available questions; gapCount reflects shortfall; non-fatal per ADR-004

## Related

- **Stories**: 004-mixed-question-types
- **Previous ADRs**: ADR-004 (Non-Fatal AI Degradation), ADR-007 (Session Created with Actual Count)
