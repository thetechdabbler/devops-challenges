---
unit: 001-reviewer-question-management-service
bolt: 012-reviewer-question-management-service
stage: design
status: complete
updated: 2026-03-06T08:47:27Z
---

# Technical Design - Reviewer Question Management Service

## Architecture Pattern

Layered service architecture (Controller -> Service -> Repository) with DDD-aligned domain boundaries.

Rationale:
- Matches existing backend project structure and coding standards.
- Keeps authorization/validation/business logic centralized in service layer.
- Enables clear test boundaries for controller, service, and repository behavior.

## Layer Structure

```text
┌─────────────────────────────────────────┐
│ Presentation (Express Controllers)      │  HTTP routes, request/response mapping
├─────────────────────────────────────────┤
│ Application (Services)                  │  Use-case orchestration + rules
├─────────────────────────────────────────┤
│ Domain (Validation/Conflict/Audit rules)│  Reviewer policy + invariants
├─────────────────────────────────────────┤
│ Infrastructure (Prisma Repositories)    │  PostgreSQL persistence
└─────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/reviewer/questions` | GET | query: `topics,type,difficulty,experience_level,status,cursor,limit` | paginated list + `nextCursor` |
| `/api/v1/reviewer/questions` | POST | body: `{ text, answer, type, topics[], difficulty, experienceLevel, status }` | created question record |
| `/api/v1/reviewer/questions/:id` | PATCH | body: `{ patch fields..., revisionToken }` | updated question or `409` conflict payload |
| `/api/v1/reviewer/questions/:id/archive` | POST | empty/body with optional reason | archived question state (idempotent) |

Response format follows existing API conventions: `{ status, data }` for success and standard error envelope for failures.

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| `questions` (existing) | `id,text,answer,type,difficulty,experience_level,status,updated_at,...` | existing topic relations reused |
| `question_audit_events` (new) | `id,question_id,actor_id,action,before_json,after_json,occurred_at` | `question_id -> questions.id` |

Notes:
- Use soft-delete by setting status to archived/rejected-equivalent safe state (or dedicated archived status if schema supports).
- Optimistic concurrency uses `updated_at` or integer `version` predicate in update where-clause.

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Existing JWT cookie auth middleware (`authenticate`) |
| Authorization | Reviewer role guard middleware on all reviewer management routes |
| Input Validation | Server-side schema validation for create/update/list filters |
| Audit Integrity | Immutable append-only audit rows; no update/delete endpoint for audit table |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Performance | Indexed filter fields; bounded limit; keyset-style cursor where feasible |
| Scalability | Stateless service nodes; DB-level pagination; lightweight response payloads |
| Reliability | Transactional mutation + audit write for create/update/archive |
| Data Quality | Strong DTO validation + enum constraints + topic cardinality checks |
| Stale-Write Prevention | Conflict detection via revision token and `409` response contract |

## Error Handling

| Error Type | Code | Response |
|------------|------|----------|
| Unauthenticated | 401 | standard auth error envelope |
| Forbidden (non-reviewer) | 403 | standard authorization error envelope |
| Validation failure | 400 | field-level error details |
| Not found | 404 | deterministic not-found message |
| Stale write conflict | 409 | conflict envelope + latest record metadata |
| Internal failure | 500 | generic error envelope + server log correlation |

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| Auth/JWT middleware | Identity and role claims | Internal middleware |
| PostgreSQL (Prisma) | Question and audit persistence | Prisma client |
