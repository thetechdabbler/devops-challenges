---
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
phase: inception
status: draft
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: 2026-03-06T08:40:22Z
updated: 2026-03-06T08:40:22Z
---

# Unit Brief: Reviewer Question Management UI

## Purpose

Build the reviewer-facing module for fast, auditable question management workflows, including conflict handling and accidental-delete safeguards.

## Scope

### In Scope
- Reviewer entry point/navigation to management module
- Filtered question list and details view
- Create/edit forms for question + answer metadata
- Archive confirmation UX and idempotent delete handling
- Stale-data conflict recovery flow (refresh and re-apply)

### Out of Scope
- Backend persistence logic and audit storage implementation
- Reviewer identity provisioning

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Reviewer-Only Access to Management Module | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| ReviewerQuestionListState | UI state for list/filter pagination | filters, sort, cursor/page, loading |
| ReviewerQuestionEditorState | Form model for create/edit | text, answer, type, topics, difficulty, level, status, revision token |
| MutationFeedbackState | UI feedback for errors/conflicts/success | kind, message, conflictPayload |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| loadQuestionList | Fetch and render filtered results | filters | list rows + pagination |
| submitCreate | Send create payload with validation feedback | form payload | created row + success state |
| submitUpdate | Send update with revision token | form payload + token | updated row or conflict state |
| confirmArchive | Confirm and archive selected question | question id | archived state reflected in list |

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
| 001-reviewer-module-entry | Reviewer navigation and module entry | Must | Planned |
| 002-question-form-create-edit | Create/edit form UX with validation display | Must | Planned |
| 003-delete-confirmation-and-archive | Archive confirmation safeguards | Must | Planned |
| 004-conflict-and-stale-data-recovery | Handle stale-data conflicts and refresh flow | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-reviewer-question-management-service | Provides listing, CRUD, conflict, archive, and audit-backed APIs |

### Depended By
| Unit | Reason |
|------|--------|
| None | Final user-facing layer |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Browser runtime | Form handling and interaction | Low |

---

## Technical Context

### Suggested Technology
- Existing React + TypeScript frontend patterns in portal app
- Existing API client + protected route/auth store patterns

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Reviewer management APIs | Internal API | HTTP JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| UI form/list state | In-memory client state | small | session |

---

## Constraints

- Must surface conflict (`409`) responses clearly and support retry flow.
- Must require explicit user confirmation before archive action.
- Must keep reviewer workflows fast and keyboard-friendly where practical.

---

## Success Criteria

### Functional
- [ ] Reviewer can navigate to module and list/filter questions.
- [ ] Reviewer can create and edit with clear field-level validation errors.
- [ ] Reviewer confirms archive actions before execution.
- [ ] Reviewer can resolve stale-data conflicts by refreshing latest record and resubmitting.

### Non-Functional
- [ ] Local UI interactions respond in < 200ms.
- [ ] List and edit workflows keep median completion within 90 seconds target.

### Quality
- [ ] Component/integration tests cover create/edit/archive/conflict states.
- [ ] Error and loading states are explicit and recoverable.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 014-reviewer-question-management-ui | simple-construction-bolt | 001, 002, 003, 004 | Deliver complete reviewer management UX over new service APIs |
