---
bolt: 006-interview-session-service
created: 2026-03-06T04:59:03Z
status: accepted
---

# ADR-010: Keyset Pagination for Session History

## Context

Session history must return a user-scoped list ordered by `created_at DESC` with stable pagination under concurrent inserts. Offset pagination can produce duplicates or skipped rows as new sessions are created.

## Decision

Use keyset (cursor) pagination for `GET /api/v1/sessions` with cursor encoded from `(created_at, id)` and query ordering `created_at DESC, id DESC`.

## Rationale

Keyset pagination keeps page boundaries stable and performant for growing datasets. `(created_at, id)` provides deterministic ordering even when timestamps collide.

## Consequences

### Positive

- Stable pagination during new session creation.
- Better query performance than high-offset pagination.
- Deterministic ordering with tie-breaker on `id`.

### Negative

- Cursor encoding/validation adds minor complexity.
- Random page jumps are not supported (by design).

## Related

- Stories: `008-session-history-list`
