---
bolt: 006-interview-session-service
created: 2026-03-06T04:59:03Z
status: accepted
---

# ADR-011: Review Mode Always Returns Answer Content

## Context

Story `009-session-review` requires that session detail always include answer/explanation during review, even when a question was not revealed during the live session.

## Decision

`GET /api/v1/sessions/:id` returns full review payload including `answer`, `explanation`, and `key_concepts` for all questions, regardless of `answer_revealed`.

## Rationale

Review endpoint is a post-session learning surface, not live interview flow. Reveal gating already exists in active session endpoints; duplicating that gate in review mode conflicts with learning goals and story requirements.

## Consequences

### Positive

- Review endpoint is complete and consistent for learning.
- Simplifies frontend review rendering (no conditional fetch flow).
- Keeps reveal gating isolated to active-session operations.

### Negative

- Requires strict ownership enforcement to avoid cross-user data leakage.

## Related

- Stories: `009-session-review`, `006-answer-reveal`
- Prior decision: ADR-002 (answer exposure boundary in active flow)
