---
bolt: 012-reviewer-question-management-service
created: 2026-03-06T08:52:18Z
status: accepted
superseded_by: null
---

# ADR-016: Use Explicit Version Field for Optimistic Concurrency

## Context

Update operations must reject stale writes deterministically. Using timestamps alone can introduce ambiguity under precision/serialization differences.

## Decision

Use an explicit integer `version` field on questions for optimistic concurrency checks; clients submit the version token on updates, and mismatches return `409` with latest record metadata.

## Rationale

Version integers provide clear monotonic conflict semantics and avoid timestamp precision edge cases.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Use `updatedAt` as token | No schema change | Precision/timezone race ambiguity | Less deterministic conflict handling |
| Pessimistic DB locks | Strong consistency | Reduced throughput and higher contention | Overkill for reviewer workflow |

## Consequences

### Positive

- Deterministic stale-write conflict detection.
- Cleaner API contract for conflict recovery in UI.

### Negative

- Requires migration and additional version field management logic.
- Existing update paths must be adapted to increment version atomically.

### Risks

- Risk: partial adoption across endpoints causes inconsistent behavior. Mitigation: centralize update mutation path and add integration tests for all reviewer update routes.

## Related

- **Stories**: 003-update-question-with-version-check
- **Standards**: api-conventions, system-architecture
- **Previous ADRs**: None
