---
bolt: 002-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-004: Non-Fatal AI Degradation with gapCount Signal

## Context

When `getQuestionsForSession` triggers AI generation to fill a gap and OpenAI fails (network
error, rate limit, timeout, schema violation), the system must decide how to respond:

1. **Throw an error**: Surface the failure to the caller; session creation fails.
2. **Silent partial return**: Return however many questions are available; caller receives no
   signal about the shortfall.
3. **Graceful degradation with signal**: Return available questions (bank-only) and communicate
   the shortfall via `gapCount` in the response.

The session service (Bolt 004) and all future callers of `getQuestionsForSession` are directly
affected by this choice.

## Decision

AI generation failures are **non-fatal**. `getQuestionsForSession` catches all OpenAI errors,
logs them at `warn` level, and returns the bank-only result set with `gapCount` set to the
actual shortfall. The `gapCount` field in `QuestionFetchResult` is the signal — a value > 0
means the caller received fewer questions than requested.

Callers (session service) **must** handle `gapCount > 0` as a valid state, not an error.

## Rationale

A failed OpenAI call should not prevent a user from starting an interview session. The bank
may already contain enough questions for a useful session even if the gap cannot be filled.
Throwing an error on AI failure couples the user's experience to a third-party API's
availability — an unacceptable reliability dependency for a core user flow.

Silent partial return was rejected because callers need to know when they received fewer
questions than requested to make informed decisions (e.g., adjust session length, show a
notice, or attempt a retry at a higher level).

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Throw error on AI failure | Simple contract; failure is explicit | Session creation fails on OpenAI outage; poor UX; tight coupling to third-party availability | Unacceptable reliability risk |
| Silent partial return | Simple; caller needs no change | Caller cannot distinguish "bank satisfied" from "AI failed"; session may start with wrong question count | Hidden failure — misleads callers |
| Graceful degradation + gapCount (chosen) | Failure is surfaced as data not exception; bank-only sessions still work; caller can adapt | Callers must handle gapCount > 0 explicitly | None — chosen approach |

## Consequences

### Positive

- Session creation succeeds even during OpenAI outages
- `gapCount` is a clean, inspectable signal — callers and logs have full visibility
- The session service (Bolt 004) can decide how to present a short session to the user
- Consistent with the existing `QuestionFetchResult` contract — no API shape change needed

### Negative

- All callers of `getQuestionsForSession` must explicitly handle `gapCount > 0`
- A session may start with fewer questions than the user configured — requires UX consideration in session service

### Risks

- **Silent over-use of degraded mode**: If OpenAI is consistently failing and no alerting exists, the system silently runs in bank-only mode indefinitely. Mitigated by: logging at `warn` level on every AI failure; monitoring can alert on sustained warn-level logs from `question-bank.service`.
- **Caller ignores gapCount**: A future agent implements a caller that ignores `gapCount`, leading to sessions with unexpected question counts. Mitigated by: this ADR as a reference; `gapCount` field name is intentionally prominent in `QuestionFetchResult`.

## Related

- **Stories**: 003-openai-question-generation, 004-generated-question-saved-to-bank
- **Standards**: Callers of `getQuestionsForSession` must always inspect `gapCount` before committing a session
- **Previous ADRs**: ADR-003 (OpenAI structured output — defines the failure modes that trigger degradation)
