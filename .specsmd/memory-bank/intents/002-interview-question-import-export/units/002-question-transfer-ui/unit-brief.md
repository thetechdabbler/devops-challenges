---
unit: 002-question-transfer-ui
intent: 002-interview-question-import-export
phase: inception
status: complete
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: 2026-03-06T06:46:51.000Z
updated: 2026-03-06T06:46:51.000Z
---

# Unit Brief: Question Transfer UI

## Purpose

Provide a complete authenticated-user experience for importing and exporting interview questions, including validation preview and operation results.

## Scope

### In Scope
- Import/export module entry point in UI
- Export filters and download action
- CSV upload with dry-run/apply mode selection
- Validation results and apply summary presentation

### Out of Scope
- Backend CSV parsing and data persistence logic
- Auth architecture changes

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Universal Import/Export Access for App Users | Must |
| FR-5 | Import Outcome Reporting | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| ExportFilterState | Selected filters for export | topics, type, difficulty, experience_level, status |
| ImportExecutionState | Current import mode and file state | file_name, mode, is_submitting |
| ImportReportViewModel | Render model for result summary | totals, invalid_rows, duplicate_rows, inserted_rows |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| requestExport | Trigger export API and download | filters | CSV file |
| submitImportDryRun | Upload file for validation preview | file + mode=dry-run | report |
| submitImportApply | Upload file and persist valid rows | file + mode=apply | report |
| renderImportReport | Render summary and row-level issues | report payload | UI cards/tables |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-import-export-module-entry | Import/export module access for authenticated users | Must | Planned |
| 002-export-filters-and-download | Export filters and CSV download action | Must | Planned |
| 003-import-upload-and-mode | File upload with dry-run/apply modes | Must | Planned |
| 004-import-reporting-ui | Validation/apply summary and row-level error display | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-question-transfer-service | Provides all import/export APIs and reports |

### Depended By
| Unit | Reason |
|------|--------|
| None | Final user-facing unit |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Browser file APIs | Upload and download handling | Low |

---

## Technical Context

### Suggested Technology
- Existing React + TypeScript component patterns
- Existing API client patterns in `portal/frontend/src/api`

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Import/Export Backend APIs | Internal API | HTTP JSON + multipart |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| UI state | In-memory client state | small | session |

---

## Constraints

- Module must be available to any authenticated user (not role-gated in this intent).
- UX must clearly differentiate dry-run versus apply behavior.
- Error output must be actionable for bad data correction.

---

## Success Criteria

### Functional
- [ ] Authenticated users can access import/export module.
- [ ] Export filter + download flow works end-to-end.
- [ ] Import dry-run and apply are both supported and clear in UI.
- [ ] Users can see precise invalid row reasons and duplicate counts.

### Non-Functional
- [ ] UI responds within 200ms for local interactions.
- [ ] Import reports render correctly for at least 1,000 rows.

### Quality
- [ ] Component tests cover module entry, upload states, and report rendering.
- [ ] Error states are explicit and non-blocking.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 011-question-transfer-ui | simple-construction-bolt | 001, 002, 003, 004 | Deliver complete user-facing import/export workflow |
