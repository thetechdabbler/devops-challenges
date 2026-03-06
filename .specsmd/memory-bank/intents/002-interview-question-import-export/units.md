---
intent: 002-interview-question-import-export
phase: inception
status: draft
created: 2026-03-06T06:46:51Z
updated: 2026-03-06T06:46:51Z
---

# Units: Interview Question Import/Export

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Universal Import/Export Access for App Users | 002-question-transfer-ui |
| FR-2 | Export Questions for Portability | 001-question-transfer-service |
| FR-3 | Idempotent Import (No Duplicate Inserts) | 001-question-transfer-service |
| FR-4 | Bad Data Detection and Safe Handling | 001-question-transfer-service |
| FR-5 | Import Outcome Reporting | 002-question-transfer-ui |

## Units

### Unit 001: question-transfer-service
- **Purpose**: Provide backend APIs and import/export pipeline for question transfer.
- **Responsibility**: Export serialization, CSV parsing, validation, deduplication, idempotent persistence, audit metadata.
- **Assigned Requirements**: FR-2, FR-3, FR-4
- **Type**: backend (DDD)
- **Dependencies**: Existing question bank schema and repositories
- **Depended By**: 002-question-transfer-ui

### Unit 002: question-transfer-ui
- **Purpose**: Provide user-facing module for export filters, import upload, validation preview, and result reporting.
- **Responsibility**: Accessible import/export UX for authenticated users.
- **Assigned Requirements**: FR-1, FR-5
- **Type**: frontend (Simple)
- **Dependencies**: 001-question-transfer-service
- **Depended By**: None

## Dependency Graph

```text
001-question-transfer-service
        │
        ▼
002-question-transfer-ui
```

## Execution Order

1. `001-question-transfer-service` — foundation APIs + idempotent pipeline
2. `002-question-transfer-ui` — consume service APIs and present full module UX
