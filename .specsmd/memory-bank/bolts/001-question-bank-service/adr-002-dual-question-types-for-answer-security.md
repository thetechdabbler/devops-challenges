---
bolt: 001-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-002: Dual Question Types for Answer Security

## Context

Interview questions have two distinct usage contexts:

1. **Session delivery**: The user sees the question text, topic, type, and difficulty — but must NOT see the answer or explanation until they explicitly request a reveal.
2. **Answer reveal**: After the user requests a reveal, the full question including answer, explanation, and key concepts is returned.

If a single `Question` type is used throughout the system, there is a risk that future agents — or careless code — inadvertently return `answer` and `explanation` fields in session delivery responses, breaking the core interview mechanic and creating a poor UX.

## Decision

Define **two distinct TypeScript types** for questions:

- **`QuestionSummary`**: The "safe" projection — all fields except `answer`, `explanation`, and `keyConcepts`. Used in all session delivery and lookup contexts.
- **`Question`**: The "full" type — extends `QuestionSummary` with `answer`, `explanation`, and `keyConcepts`. Used only in the answer reveal flow (session service, Bolt 005).

`findByConfig` and `getQuestionsForSession` return `QuestionSummary[]`. Only a dedicated `findById` (or equivalent reveal-specific query) returns a full `Question`.

## Rationale

TypeScript's type system makes this an **enforced boundary at compile time**, not a runtime guard or documentation convention. An agent that tries to access `.answer` on a `QuestionSummary` will get a type error. This is more robust than:

- A comment saying "don't include the answer"
- A runtime check that strips the field
- Relying on all future agents to remember the rule

The pattern is well-established in API design (DTOs / projections) and adds minimal complexity — it's two interface definitions and a SELECT that omits columns.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Single `Question` type, filter at API layer | Simple domain model | Runtime-only enforcement; easy to forget; answer could leak in logs or intermediary responses | Unsafe — runtime only, not compile-time |
| Optional fields (`answer?: string`) | Single type | Consumers must check for undefined; no clear contract on when it's present | Ambiguous; doesn't encode the security boundary |
| Dual types (chosen) | Compile-time enforcement; clear intent; no accidental leaks | Slightly more verbose; two SELECT shapes needed | None — chosen approach |

## Consequences

### Positive

- TypeScript compiler prevents accidental answer exposure in session delivery code
- Clear, self-documenting contract — any agent seeing `QuestionSummary` knows it's safe for client delivery
- Reveal logic is isolated: only the session service's reveal handler works with full `Question` type
- Reduces surface area for security bugs introduced during future feature development

### Negative

- Two Drizzle query shapes: one that selects all columns, one that omits `answer`/`explanation`/`key_concepts`
- Future agents must know to use `QuestionSummary` for delivery and `Question` only for reveal — documented here and in the types file

### Risks

- **Confusion over which type to use**: Mitigated by naming convention (`Summary` = safe for delivery) and this ADR. The `Question` type should only appear in files related to the reveal flow.
- **Column selection drift**: If a new column is added to `questions` that is also sensitive, it must be manually excluded from `QuestionSummary`. Mitigated by code review and this ADR as a reference.

## Related

- **Stories**: 001-question-schema-and-storage, 002-question-lookup-by-config, 006-answer-reveal (Bolt 005)
- **Standards**: Consistent with system-architecture security pattern (no sensitive data in delivery responses)
- **Previous ADRs**: ADR-001 (junction table — defines the schema both types map to)
