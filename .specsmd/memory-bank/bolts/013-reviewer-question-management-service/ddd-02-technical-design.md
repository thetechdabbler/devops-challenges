---
unit: 001-reviewer-question-management-service
bolt: 013-reviewer-question-management-service
stage: design
status: complete
updated: 2026-03-06T11:03:40Z
---

# Technical Design - Reviewer Mutation Safety and Audit

## Architecture Pattern

Layered architecture with transactional application service for mutation paths:
- Controller: request validation + response mapping
- Service: conflict check, archive semantics, audit orchestration
- Repository: atomic DB updates and audit inserts

## Layer Structure

```text
┌─────────────────────────────────────────┐
│ Presentation (reviewer controllers)     │  PATCH/archive endpoints
├─────────────────────────────────────────┤
│ Application (mutation services)         │  conflict+archive+audit workflow
├─────────────────────────────────────────┤
│ Domain (policies)                       │  version/archival/audit invariants
├─────────────────────────────────────────┤
│ Infrastructure (Prisma repositories)    │  question + audit persistence
└─────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/reviewer/questions/:id` | PATCH | `{ revision_token, patch... }` | updated question or `409` conflict payload |
| `/api/v1/reviewer/questions/:id/archive` | POST | optional `{ reason }` | archived question state (idempotent) |
| `/api/v1/reviewer/questions/:id/audit` | GET (internal/admin usage) | query window params | audit event list |

Conflict response shape:
- `error.code = CONFLICT`
- `data.latest` with latest server record
- `data.expected_version`, `data.actual_version`

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| `Question` | add/update `version` integer, `status`, `updated_at` | existing topic links unchanged |
| `question_audit_events` | `id,question_id,actor_id,action,before_json,after_json,occurred_at` | `question_id -> Question.id` |

Mutation flow (update/archive):
1. Read current question row and capture `before_json`.
2. Apply mutation with where-clause on `id + version` for optimistic concurrency.
3. On success increment `version` and write audit event in same transaction.
4. On zero rows affected for update, return `409` with latest row.

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | existing JWT cookie auth middleware |
| Authorization | reviewer role guard on mutation endpoints |
| Data integrity | transaction wraps mutation + audit append |
| Audit immutability | no update/delete route for audit events |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Stale-write prevention | explicit version token and deterministic `409` conflict contract |
| Delete safety | archive-only semantics with idempotent behavior |
| Auditability | append-only audit rows for all successful mutations |
| Reliability | transactional consistency for mutation+audit |

## Error Handling

| Error Type | Code | Response |
|------------|------|----------|
| Missing/invalid revision token | 400 | validation error |
| Stale update | 409 | latest record payload + expected/actual version |
| Unknown question id | 404 | not found error |
| Forbidden role | 403 | reviewer access required |
| Transaction failure | 500 | internal error with correlation log |

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| Prisma/PostgreSQL | atomic mutation and audit persistence | Prisma transaction APIs |
| Existing logger | structured mutation/audit diagnostics | app logger |
