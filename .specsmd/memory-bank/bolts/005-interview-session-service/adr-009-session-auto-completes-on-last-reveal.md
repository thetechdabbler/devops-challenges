---
bolt: 005-interview-session-service
created: 2026-03-06T00:00:00Z
status: accepted
---

# ADR-009: Session Auto-Completes on Last Reveal (No Explicit Completion Endpoint)

## Context

A session has a natural end state: all questions revealed. We need a mechanism to transition `session.status` from `in_progress` to `completed`. Options are: an explicit `POST /sessions/:id/complete` endpoint that the client calls, or an implicit transition triggered automatically when the last question is revealed.

## Decision

The session auto-completes as a side effect of the last reveal. Inside `interviewSessionService.revealAnswer`, after marking `answer_revealed=true`, we count unrevealed questions. If the count is 0, we call `interviewSessionRepository.completeSession()`. No separate completion endpoint exists.

## Rationale

The "last reveal" is the only meaningful completion condition in v1 — there is no skip, no timeout, and no explicit "done" button. Making completion implicit eliminates a client-server coordination problem: the client does not need to know when to call complete; the server determines it deterministically. This also prevents sessions from being completed prematurely (before all questions are revealed) or left incomplete due to a missed client call.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Explicit `POST /sessions/:id/complete` | Clear client intent; easy to test | Client must know when to call it; session can be "completed" without all reveals | Adds coordination burden with no benefit in v1 |
| Completion on last self-rating (bolt 006) | More "done" feeling — user rated everything | Self-rating is optional; session could never complete if user skips ratings | Breaks for users who don't rate |
| Completion via background job (cron) | No client dependency | Latency; complexity; overkill | Over-engineering for a deterministic condition |

## Consequences

### Positive

- No client-server coordination needed for session completion
- Session status is always consistent with reveal state
- Simple, deterministic rule: `countUnrevealed == 0 → completed`

### Negative

- If a user never reveals the last question (abandons session), it stays `in_progress` indefinitely
- Sessions cannot be "force completed" without a code change (acceptable in v1)

### Risks

- **Race condition**: two simultaneous reveals of different questions — `countUnrevealed` check is done after the atomic reveal update, not inside the same transaction. In practice: users reveal questions sequentially; concurrent reveals of different questions are not a realistic scenario. Mitigation: if needed in v2, move `countUnrevealed + completeSession` into a transaction.
- **Abandoned sessions in history**: sessions that were started but never completed appear as `in_progress` in session history. Session history API (bolt 006) should filter or label these appropriately.

## Related

- **Stories**: 006-answer-reveal, 008-session-history-list
- **Previous ADRs**: ADR-007 (Session Created with Actual Count)
