---
unit: 001-reviewer-question-management-service
intent: 003-admin-question-management
phase: inception
status: draft
created: 2026-03-06T08:40:22Z
updated: 2026-03-06T08:40:22Z
---

# Unit Brief: Reviewer Question Management Service

## Purpose

Build the backend service layer for reviewer-only question management with strict validation, stale-write protection, soft-delete safety, and immutable audit events.

## Scope

### In Scope
- Reviewer role authorization for management endpoints
- Create/update/archive (soft-delete) question operations
- Optimistic concurrency checks for stale writes
- Filtered listing with pagination
- Immutable audit event creation for mutations

### Out of Scope
- Reviewer UI rendering and client interactions
- Auth provider redesign or new identity system

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-2 | Create Question with Required Answer and Metadata | Must |
| FR-3 | Update Existing Question with Stale-Data Protection | Must |
| FR-4 | Delete Question with Accidental-Delete Guardrails | Must |
| FR-5 | List and Filter Questions for Fast Operations | Must |
| FR-6 | Audit Trail for CRUD Actions | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| ReviewerManagedQuestion | Canonical question record managed by reviewers | id, text, answer, type, topics, difficulty, experienceLevel, status, version, updatedAt |
| QuestionRevisionToken | Optimistic lock token for updates | version or updatedAt |
| QuestionAuditEvent | Immutable mutation event for governance | id, actorId, action, questionId, before, after, timestamp |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| listQuestions | Fetch filtered paginated question list | filters + cursor/page | list + pagination metadata |
| createQuestion | Persist a validated question | create payload | created question |
| updateQuestion | Update a question with conflict check | update payload + revision token | updated question or 409 conflict |
| archiveQuestion | Soft-delete/archive a question | question id + reviewer identity | archived question state |
| recordAuditEvent | Persist immutable audit event | mutation context | audit event id |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 6 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-reviewer-role-access-control | Reviewer role access enforcement | Must | Planned |
| 002-create-question-validation | Create question with strict validation | Must | Planned |
| 003-update-question-with-version-check | Update with stale-write conflict protection | Must | Planned |
| 004-soft-delete-question | Archive question with idempotent delete behavior | Must | Planned |
| 005-list-filtered-questions | Filtered paginated listing for reviewer operations | Must | Planned |
| 006-audit-trail-recording | Immutable audit events for CRUD actions | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| Existing auth middleware | Reviewer role claims required for access control |
| Existing question repository/schema | Reuse current question storage model |

### Depended By
| Unit | Reason |
|------|--------|
| 002-reviewer-question-management-ui | UI depends on CRUD/list/conflict APIs |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| PostgreSQL | Durable storage for questions + audit events | Medium |

---

## Technical Context

### Suggested Technology
- Express controllers/services/repositories in existing backend codebase
- Prisma transactions for mutation + audit persistence
- Existing auth middleware with role checks

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Reviewer UI | Internal API | HTTP JSON |
| Question Bank Domain | Internal service/repository | TypeScript calls |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Questions | PostgreSQL | 100k+ | Long-term |
| Audit events | PostgreSQL | High write rate | 90+ days |

---

## Constraints

- All mutation endpoints must be reviewer-only.
- Archive (soft-delete) is mandatory default behavior for delete actions.
- Mutation and audit event must be consistent in a single request lifecycle.

---

## Success Criteria

### Functional
- [ ] Reviewer-only endpoints enforce `401/403` behavior correctly.
- [ ] Create/update/archive/list flows satisfy acceptance criteria.
- [ ] Update conflicts return deterministic `409` responses with latest data.
- [ ] Every mutation creates an immutable audit event.

### Non-Functional
- [ ] p95 list latency < 400ms.
- [ ] p95 mutation latency < 300ms.

### Quality
- [ ] Unit/integration tests cover auth, validation, conflicts, archive, and audit paths.
- [ ] Regression tests ensure archived questions are excluded from active selection.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 012-reviewer-question-management-service | ddd-construction-bolt | 001, 002, 005 | Deliver reviewer auth, create validation, and listing foundation |
| 013-reviewer-question-management-service | ddd-construction-bolt | 003, 004, 006 | Deliver conflict-safe updates, archive semantics, and audit trail |
