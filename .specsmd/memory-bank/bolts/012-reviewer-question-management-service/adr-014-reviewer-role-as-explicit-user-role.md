---
bolt: 012-reviewer-question-management-service
created: 2026-03-06T08:52:18Z
status: accepted
superseded_by: null
---

# ADR-014: Reviewer Role as Explicit User Role

## Context

Reviewer-only question management requires role-based access distinct from generic authenticated users. Existing ADR-006 established a flat user role enum (`user | admin`) rather than RBAC tables.

## Decision

Extend the existing flat role model to include an explicit `reviewer` role (`user | reviewer | admin`) and enforce reviewer-only checks on management APIs.

## Rationale

This keeps authorization simple and aligned with current architecture while enabling precise access control for this intent.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Map reviewer capability to `admin` | No schema change | Over-privileged reviewers, weaker least-privilege posture | Violates reviewer-only scope |
| Full RBAC migration now | Most flexible | High complexity and migration cost | Out of scope for current bolt |

## Consequences

### Positive

- Enables least-privilege access for reviewer workflows.
- Preserves existing flat-role auth implementation style.

### Negative

- Requires schema + token claim updates for new role value.
- Role changes still follow token refresh behavior unless token lifecycle is revised.

### Risks

- Risk: stale JWT role claims after role changes. Mitigation: short token TTL or explicit re-login after role update in admin operations.

## Related

- **Stories**: 001-reviewer-role-access-control
- **Standards**: api-conventions, system-architecture
- **Previous ADRs**: ADR-006, ADR-005
