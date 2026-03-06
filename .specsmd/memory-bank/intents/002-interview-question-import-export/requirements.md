---
intent: 002-interview-question-import-export
phase: inception
status: complete
created: 2026-03-06T06:46:51.000Z
updated: 2026-03-06T06:46:51.000Z
---

# Requirements: Interview Question Import/Export

## Intent Overview

Add a module for authenticated users to export interview questions and import them back in bulk with strong validation, idempotent deduplication, and clear outcome reporting.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Improve portability | Exported files can be imported in other environments successfully | Must |
| Ensure idempotency | Re-importing same dataset inserts zero duplicates | Must |
| Protect data quality | Invalid rows are rejected and reported clearly | Must |
| Improve operational confidence | High import success rate on valid datasets | Must |

---

## Functional Requirements

### FR-1: Universal Import/Export Access for App Users
- **Description**: Any authenticated user can access import/export features.
- **Acceptance Criteria**:
  - Import/export endpoints and UI are accessible to logged-in users.
  - Unauthenticated users are denied.
  - Operation audit captures initiating user identity.
- **Priority**: Must
- **Related Stories**: 001-import-export-module-entry

### FR-2: Export Questions for Portability
- **Description**: Users can export questions as portable CSV.
- **Acceptance Criteria**:
  - Export supports CSV in MVP.
  - Export includes full question fields needed for round-trip import.
  - Export supports filters by topic, type, difficulty, experience level, and status.
  - Empty matches return a valid header-only CSV.
- **Priority**: Must
- **Related Stories**: 001-export-questions-csv, 002-export-filters-and-download

### FR-3: Idempotent Import (No Duplicate Inserts)
- **Description**: Import apply must prevent duplicate inserts when logical rows already exist.
- **Acceptance Criteria**:
  - Deterministic deduplication key is used for import rows.
  - Re-running same dataset creates zero new duplicates.
  - Duplicate count is returned in run summary.
- **Priority**: Must
- **Related Stories**: 003-idempotent-dedup-logic, 004-import-apply-persistence

### FR-4: Bad Data Detection and Safe Handling
- **Description**: Import validates rows and blocks malformed data from persistence.
- **Acceptance Criteria**:
  - Required fields and enums are validated for each row.
  - Invalid rows include row index and reason.
  - Invalid rows are not persisted.
  - Dry-run performs validation without writes.
- **Priority**: Must
- **Related Stories**: 002-import-dry-run-validation, 005-import-error-reporting

### FR-5: Import Outcome Reporting
- **Description**: Users get detailed and actionable import results.
- **Acceptance Criteria**:
  - Result includes total/valid/invalid/inserted/duplicate counts.
  - Row-level errors are available for invalid rows.
  - UI displays summary and detailed issues clearly.
- **Priority**: Must
- **Related Stories**: 005-import-error-reporting, 004-import-reporting-ui

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Export generation | p95 response (up to 5,000 rows) | < 3s |
| Dry-run validation | 1,000-row validation time | < 5s |
| Apply import | 1,000-row apply time | < 8s |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Bulk size | Rows per import | >= 5,000 |
| Dedup throughput | Rows processed per second | >= 500 rows/s |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Access control | Authenticated-only | No unauthenticated access |
| Data integrity | Strict row validation | Malformed rows rejected |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Idempotency | Duplicate inserts on repeat import | 0 |
| Data quality containment | Invalid rows persisted | 0 |

### Portability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Cross-environment transfer success | Valid row import success | > 99% |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Required standards are loaded from memory-bank standards.

**Intent-specific constraints**:
- CSV is the MVP format.
- Import must enforce deterministic deduplication/idempotency.
- Field schema for import/export must remain compatible with existing question model.

### Business Constraints
- Prioritize portability and data quality over advanced format support.

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Users can follow CSV template format | Many invalid rows | Provide dry-run and precise validation feedback |
| Deterministic dedup key is sufficient for duplicates | Some near-duplicates may remain | Track and refine dedup rules in follow-up |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Should MVP also support JSON import/export? | Product | TBD | Pending |
| Should invalid-row reports be downloadable? | Product + UI | TBD | Pending |
| Should apply mode be all-or-nothing or partial success by default? | Backend | TBD | Pending |
