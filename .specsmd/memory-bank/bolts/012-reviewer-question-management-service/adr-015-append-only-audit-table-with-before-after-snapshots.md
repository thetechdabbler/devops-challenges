---
bolt: 012-reviewer-question-management-service
created: 2026-03-06T08:52:18Z
status: accepted
superseded_by: null
---

# ADR-015: Append-Only Audit Table with Before/After Snapshots

## Context

Reviewer CRUD operations must be auditable with actor, timestamp, and mutation details. Existing logs are insufficient for reliable queryable audit history over entity-level changes.

## Decision

Persist reviewer mutation audits in an append-only `question_audit_events` table storing actor, action, question id, timestamp, and serialized before/after snapshots.

## Rationale

A dedicated table provides deterministic, queryable audit history and supports compliance/reporting use-cases better than transient logs.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Application logs only | Low implementation effort | Hard to query reliably; retention variability | Fails auditability objective |
| Diff-only storage | Smaller footprint | Harder forensic replay for complex fields | Chose clearer before/after snapshots |

## Consequences

### Positive

- Reliable event-level traceability for all reviewer mutations.
- Supports targeted audit queries by question, actor, and time window.

### Negative

- Additional storage growth and index management overhead.
- Snapshot payload may increase write size for frequent updates.

### Risks

- Risk: audit writes fail independently of mutation. Mitigation: perform mutation + audit in single transaction boundary.

## Related

- **Stories**: 006-audit-trail-recording
- **Standards**: data-stack, coding-standards
- **Previous ADRs**: None
