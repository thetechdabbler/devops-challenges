---
bolt: 004-interview-session-service
created: 2026-03-06T00:00:00Z
status: accepted
---

# ADR-007: Session Created with Actual Question Count on Bank Gap

## Context

When a user creates a session, `questionBankService.getQuestionsForSession` is called with the requested `question_count`. Per ADR-004, if the bank cannot provide enough questions (AI gap-fill also insufficient), the service returns fewer questions with `gapCount > 0` rather than throwing.

At the session layer, we must decide what to do when fewer questions are available than requested: fail the session creation with an error, or create the session with the actual question count.

## Decision

Create the session with the actual number of questions returned (`questions.length`), storing that as `question_count` on the Session record. Include `gap_count` in the POST /api/v1/sessions response so the client is informed. Do not fail the request.

## Rationale

Failing the request would force the user to reconfigure and retry — a poor UX, especially since the gap is typically small (1-2 questions). A slightly shorter session is functionally equivalent to the requested one for interview practice purposes. The user is informed via the response field and can choose to start a new session with different config if desired.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Return 503 if gapCount > 0 | Clear failure signal | Forces retry; no session created; poor UX for minor gaps | Too aggressive for minor shortfalls |
| Return 422 with gap info, no session | Honest about failure | User loses work; must reconfigure | Same problem — user must start over |
| Create session, set question_count to requested (not actual) | Simpler data model | question_count field would be inaccurate; confuses history view | Data integrity violation |
| Create session silently (no gap_count in response) | Simpler API | Client has no signal that count differs from request | Violates transparency; breaks client UI expectations |

## Consequences

### Positive

- Session creation always succeeds as long as at least 1 question is returned
- `question_count` on Session accurately reflects the actual session length
- Client receives `gap_count` field to surface a warning if desired
- Consistent with ADR-004 non-fatal degradation philosophy

### Negative

- Client must handle the case where `question_count` in response differs from requested count
- Users may be surprised if they requested 15 questions and get 12

### Risks

- **Extreme gap (0 questions returned)**: If questionBankService returns an empty array, session creation would produce a 0-question session. Mitigation: validate `questions.length >= 1` after the service call; return 503 only in this degenerate case.

## Related

- **Stories**: 001-session-configuration, 002-session-created-and-persisted
- **Previous ADRs**: ADR-004 (Non-Fatal AI Degradation with gapCount Signal)
