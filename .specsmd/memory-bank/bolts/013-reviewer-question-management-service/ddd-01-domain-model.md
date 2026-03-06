---
unit: 001-reviewer-question-management-service
bolt: 013-reviewer-question-management-service
stage: model
status: complete
updated: 2026-03-06T10:52:44Z
---

# Static Model - Reviewer Mutation Safety and Audit

## Bounded Context

Reviewer mutation safety context: conflict-aware updates, archival semantics, and immutable audit capture for question lifecycle actions.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| QuestionVersionState | questionId, version, updatedAt | update requires current version match; stale versions are rejected |
| ArchivedQuestionState | questionId, status, archivedAt | archival is idempotent; archived questions must remain queryable for audit and restore workflows |
| MutationCommand | actorId, questionId, action, payload, revisionToken | each command must authorize reviewer and validate invariants |
| AuditMutationRecord | id, questionId, actorId, action, beforeSnapshot, afterSnapshot, occurredAt | append-only; one record per successful mutation |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| VersionToken | version | must be present on update; integer >= 0 |
| ConflictSnapshot | expectedVersion, actualVersion, latestQuestion | included in `409` payload for stale updates |
| ArchiveIntent | reason?, requestedAt | confirmation required at UI layer; backend performs idempotent archive |
| AuditPayload | beforeJson, afterJson | serializable and immutable after write |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| ManagedQuestionMutationAggregate | QuestionVersionState, ArchivedQuestionState | update fails on stale version; archive changes state once and remains idempotent |
| AuditTrailAggregate | AuditMutationRecord | audit event emitted for each successful update/archive and cannot be modified |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| QuestionUpdateApplied | update with matching version succeeds | questionId, actorId, fromVersion, toVersion, occurredAt |
| QuestionUpdateConflictDetected | update version mismatch | questionId, actorId, expectedVersion, actualVersion, occurredAt |
| QuestionArchived | archive command succeeds or no-op acknowledged | questionId, actorId, priorStatus, newStatus, occurredAt |
| MutationAudited | audit record persisted | auditEventId, questionId, action, actorId |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| ConflictPolicyService | validateVersionToken, buildConflictResponse | question repository |
| ArchivePolicyService | archiveQuestionIdempotent | question repository |
| MutationAuditService | captureBeforeAfter, appendAuditEvent | audit repository |
| ReviewerMutationService | updateQuestion, archiveQuestion | conflict + archive + audit services |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| ReviewerQuestionRepository | ManagedQuestionMutationAggregate | getForUpdate(id), updateWithVersion(id, version, patch), archiveIdempotent(id) |
| QuestionAuditRepository | AuditMutationRecord | append(record), listByQuestion(id, window) |

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Stale Update | Mutation request carrying outdated version token |
| Conflict Response | Deterministic `409` payload containing latest server version |
| Archive | Soft-delete operation retaining historical data |
| Idempotent Archive | Repeated archive requests produce consistent safe outcome |
| Mutation Audit | Immutable record of a successful reviewer mutation |
