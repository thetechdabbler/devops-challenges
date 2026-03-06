---
bolt: 003-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-006: Flat UserRole Enum Instead of RBAC Table

## Context

The interview bot requires admin-only endpoints (bulk generation, review queue, stats). A role
system must be introduced to distinguish regular users from administrators.

Two common approaches:

1. **Flat role field**: Add a `role: user | admin` enum column to the `User` table. Role is a
   single string, one per user.
2. **Roles/permissions table**: A separate `Role` and/or `Permission` table with many-to-many
   relationships to `User`. Supports granular permissions, multiple roles per user, and
   role-based feature flags.

## Decision

Add a single `role: UserRole` field (enum: `user | admin`) directly to the `User` model.
No separate roles or permissions table.

## Rationale

The system has exactly two actor types: regular users and administrators. There are no plans
for granular permissions (e.g., "can generate but not approve"), multiple roles per user, or
role-based feature flags within the admin tier. A full RBAC table introduces join complexity
and migration overhead for a distinction that is binary in this context.

The flat enum is sufficient, readable, and directly queryable without joins.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| RBAC table (`roles`, `user_roles`) | Extensible; supports multiple roles; granular permissions | Join complexity; migration overhead; overkill for two actor types | No current or planned need for granularity |
| Permission flags (boolean columns) | Very explicit | Doesn't scale; schema changes per new permission | Worse than enum for this use case |
| Flat enum (chosen) | Simple; directly queryable; zero join overhead | Only one role per user; adding a third role requires schema migration | Acceptable — two roles covers all current requirements |

## Consequences

### Positive

- Zero join overhead — `WHERE role = 'admin'` needs no join
- Schema is self-documenting — `role` field on User is obvious
- JWT payload is minimal — single string field

### Negative

- A third role (e.g., `moderator`) requires a schema migration and Prisma enum update
- Only one role per user — a user cannot be both `admin` and a special `reviewer` simultaneously

### Risks

- **Role proliferation**: If the admin tier needs internal subdivision (e.g., read-only admin vs
  write admin), the enum must be extended or migrated to a table. Mitigated by: this ADR
  documents the limitation — a future agent wanting to add roles should consider migrating to a
  roles table at that point rather than endlessly extending the enum.

## Related

- **Stories**: 006-admin-bulk-generation, 007-admin-review-approve-reject, 008-admin-bank-stats
- **Standards**: None — this establishes the role model for the project
- **Previous ADRs**: ADR-005 (role cached in JWT — the JWT payload shape depends on this decision)
