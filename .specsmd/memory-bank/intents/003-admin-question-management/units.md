---
intent: 003-admin-question-management
phase: inception
status: draft
created: 2026-03-06T08:40:22Z
updated: 2026-03-06T08:40:22Z
---

# Units: Reviewer Question Management

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Reviewer-Only Access to Management Module | 002-reviewer-question-management-ui |
| FR-2 | Create Question with Required Answer and Metadata | 001-reviewer-question-management-service |
| FR-3 | Update Existing Question with Stale-Data Protection | 001-reviewer-question-management-service |
| FR-4 | Delete Question with Accidental-Delete Guardrails | 001-reviewer-question-management-service |
| FR-5 | List and Filter Questions for Fast Operations | 001-reviewer-question-management-service |
| FR-6 | Audit Trail for CRUD Actions | 001-reviewer-question-management-service |

## Units

### Unit 001: reviewer-question-management-service
- **Purpose**: Deliver reviewer-authorized backend APIs for question CRUD, stale-write protection, soft-delete, filtering, and auditing.
- **Responsibility**: Business rules, validation, optimistic concurrency conflict handling, audit event persistence.
- **Assigned Requirements**: FR-2, FR-3, FR-4, FR-5, FR-6
- **Type**: backend (DDD)
- **Dependencies**: Existing question repository + auth middleware role claims
- **Depended By**: 002-reviewer-question-management-ui

### Unit 002: reviewer-question-management-ui
- **Purpose**: Deliver reviewer-facing UI workflows for list/filter/create/edit/archive and conflict/error handling.
- **Responsibility**: Fast reviewer operations UX with explicit safeguards and stale-data recovery prompts.
- **Assigned Requirements**: FR-1
- **Type**: frontend (Simple)
- **Dependencies**: 001-reviewer-question-management-service
- **Depended By**: None

## Dependency Graph

```text
001-reviewer-question-management-service
                │
                ▼
002-reviewer-question-management-ui
```

## Execution Order

1. `001-reviewer-question-management-service` — API foundation + safety and audit guarantees
2. `002-reviewer-question-management-ui` — reviewer workflows consuming finalized APIs
