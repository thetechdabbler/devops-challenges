---
id: 001-reviewer-module-entry
unit: 002-reviewer-question-management-ui
intent: 003-admin-question-management
status: draft
priority: must
created: 2026-03-06T08:40:22Z
assigned_bolt: 014-reviewer-question-management-ui
implemented: false
---

# Story: 001-reviewer-module-entry

## User Story

**As a** reviewer
**I want** an obvious entry point to question management
**So that** I can start review operations quickly

## Acceptance Criteria

- [ ] **Given** reviewer is authenticated, **When** they view navigation, **Then** reviewer management entry is visible.
- [ ] **Given** non-reviewer user, **When** they view navigation, **Then** reviewer management entry is hidden or blocked.
- [ ] **Given** reviewer opens module, **When** route loads, **Then** list view renders with default filters.

## Technical Notes

- Reuse auth store role data for client-side gating.
- Server-side role checks remain source of truth.

## Dependencies

### Requires
- 005-list-filtered-questions

### Enables
- 002-question-form-create-edit
- 003-delete-confirmation-and-archive

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Role not loaded yet | Show loading state, avoid flicker |
| Direct URL by non-reviewer | Show forbidden state or redirect |

## Out of Scope

- Reviewer onboarding flow
