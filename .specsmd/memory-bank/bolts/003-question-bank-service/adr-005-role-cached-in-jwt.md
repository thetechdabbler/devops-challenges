---
bolt: 003-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-005: Admin Role Cached in JWT (Not Verified Per-Request from DB)

## Context

The system uses stateless JWT authentication. When a user logs in, a JWT is issued with a 24h
lifetime. This bolt introduces an admin role that gates sensitive endpoints.

Two approaches exist for enforcing the role:

1. **JWT-cached role**: Embed `role` in the JWT payload at login. `requireAdmin` reads
   `req.user.role` — no DB query needed. Role changes take effect only when the token expires.
2. **Per-request DB lookup**: `requireAdmin` queries the DB on every admin request to get the
   current role. Role changes are effective immediately.

The choice has direct security and operational consequences: how quickly can admin access be
revoked?

## Decision

Embed `role` in the JWT payload at login. `requireAdmin` reads `req.user.role` from the
already-verified token. No additional DB lookup is performed per request.

Role changes (promote/demote) take effect **when the user's current JWT expires** (up to 24h).

## Rationale

The portal is a single-instance self-hosted application with a very small user base (primarily
the developer/owner). The probability of needing to revoke admin access within a 24h window is
effectively zero in this operational context.

Per-request DB lookup adds latency and a DB round-trip to every admin endpoint — a non-trivial
cost for what is a rare operational concern. The stateless JWT model was chosen deliberately for
the portal; introducing a stateful lookup for role checks partially defeats that design.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Per-request DB lookup | Immediate role revocation | Extra DB query on every admin request; breaks stateless JWT model | Unnecessary overhead for this use case |
| Token blocklist / short TTL | Immediate revocation possible | Requires Redis or similar; high operational complexity | Over-engineered for single-instance self-hosted app |
| JWT role caching (chosen) | Zero overhead; stateless; simple | Role changes lag by up to 24h | Acceptable trade-off given operational context |

## Consequences

### Positive

- Zero overhead on admin endpoints — no extra DB query
- Consistent with the portal's stateless JWT design
- Simple implementation — `requireAdmin` is a pure function with no dependencies

### Negative

- Admin demotion takes up to 24h to take effect for active sessions
- If a user's role is changed in the DB directly, the JWT must be manually invalidated (or waited out)

### Risks

- **Stale admin access**: A demoted admin retains access for up to 24h. Mitigated by: the
  application has a tiny, known user base; admin role is assigned manually and rarely changed.
  If immediate revocation is needed in an emergency, the JWT_SECRET can be rotated to invalidate
  all tokens instantly.
- **JWT_SECRET rotation as emergency revocation**: Documented here as the escape hatch. Rotating
  `JWT_SECRET` invalidates all sessions for all users.

## Related

- **Stories**: 006-admin-bulk-generation, 007-admin-review-approve-reject, 008-admin-bank-stats
- **Standards**: Consistent with system-architecture standard (JWT + middleware)
- **Previous ADRs**: None — first decision about role enforcement in this project
