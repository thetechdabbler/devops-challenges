---
unit: 001-reviewer-question-management-service
bolt: 012-reviewer-question-management-service
stage: model
status: complete
updated: 2026-03-06T08:46:19Z
---

# Static Model - Reviewer Question Management Service

## Bounded Context

Reviewer Question Management: reviewer-authorized lifecycle management of interview questions (create, list/filter, validate, archive) with data-quality guarantees and auditable mutation traceability.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| ReviewerManagedQuestion | id, text, answer, type, topics[], difficulty, experienceLevel, status, createdAt, updatedAt, archivedAt?, version | text/answer/type/topics/difficulty/experienceLevel/status are required; archived questions are excluded from active operations; version increments on each mutation |
| ReviewerIdentity | userId, role, username | only `reviewer` role can execute management operations |
| QuestionListQuery | topics?, type?, difficulty?, experienceLevel?, status?, cursor/page, pageSize | only supported filter enums accepted; deterministic ordering for stable pagination |
| AuditEventRecord | id, questionId, actorId, action, beforeSnapshot, afterSnapshot, occurredAt | immutable after write; required for all create/update/archive mutations |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| QuestionContent | text, answer | both non-empty; normalized whitespace policy applied |
| QuestionMetadata | type, topics[], difficulty, experienceLevel, status | topics length >= 1; enums must match allowed values |
| RevisionToken | version or updatedAt | required for update; stale token must trigger conflict |
| QueryWindow | cursor/page, pageSize | page size bounded to configured max; invalid windows rejected |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| ReviewerManagedQuestion | QuestionContent, QuestionMetadata, RevisionToken | only reviewer-authorized commands mutate state; archive is soft-delete; version monotonicity enforced |
| QuestionAuditTrail | AuditEventRecord | every mutation command commits corresponding audit event; audit event immutability |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| QuestionCreated | valid create command persisted | questionId, actorId, createdSnapshot, occurredAt |
| QuestionUpdated | update command with valid current revision token persisted | questionId, actorId, beforeSnapshot, afterSnapshot, occurredAt |
| QuestionArchived | archive command persisted | questionId, actorId, beforeSnapshot, afterSnapshot, occurredAt |
| StaleUpdateRejected | update command with stale revision token | questionId, actorId, expectedToken, actualToken, occurredAt |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| ReviewerAuthorizationService | assertReviewerAccess | auth middleware/user claims |
| QuestionValidationService | validateCreatePayload, validateQueryFilters | schema validators, enum catalog |
| QuestionManagementService | createQuestion, listQuestions, updateQuestion, archiveQuestion | question repository, audit repository, validation service |
| ConflictDetectionService | assertFreshRevision | question repository current revision state |
| AuditTrailService | recordMutationAudit | audit repository, clock |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| ReviewerQuestionRepository | ReviewerManagedQuestion | listByFilters(queryWindow), create(question), getById(id), updateWithRevision(id, token, patch), archive(id) |
| QuestionAuditRepository | AuditEventRecord | append(event), listByQuestionId(questionId, window) |

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Reviewer | Authorized role allowed to manage questions |
| Managed Question | Question record under reviewer lifecycle control |
| Archive | Soft-delete operation that removes from active usage while retaining record |
| Revision Token | Concurrency marker used to detect stale updates |
| Stale Update | Update attempt using outdated revision token |
| Active Question | Non-archived question eligible for interview selection |
| Audit Event | Immutable mutation record for create/update/archive actions |
