---
id: 007-admin-review-approve-reject
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: should
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 003-question-bank-service
implemented: true
---

# Story: 007-admin-review-approve-reject

## User Story

**As an** admin
**I want** to review AI-generated questions and approve or reject them
**So that** only quality-controlled questions enter the active bank

## Acceptance Criteria

- [ ] **Given** pending_review questions exist, **When** I GET /api/v1/admin/questions?status=pending_review, **Then** I receive a paginated list of pending questions
- [ ] **Given** I am reviewing a question, **When** I PATCH /api/v1/admin/questions/:id with {action: "approve"}, **Then** the question status changes to active
- [ ] **Given** I am reviewing a question, **When** I PATCH /api/v1/admin/questions/:id with {action: "reject"}, **Then** the question status changes to rejected
- [ ] **Given** I am reviewing a question, **When** I PATCH with {action: "approve", text: "edited text"}, **Then** the question text is updated and status set to active
- [ ] **Given** I am not an admin, **When** I call any admin/questions endpoint, **Then** I receive 403 Forbidden

## Technical Notes

- GET /api/v1/admin/questions?status=pending_review|active|rejected
- PATCH /api/v1/admin/questions/:id body: { action: "approve"|"reject", text?: string }
- Rejected questions remain in DB (soft-delete pattern) for audit
- Include admin_id and reviewed_at fields on questions table

## Dependencies

### Requires
- 006-admin-bulk-generation (creates pending_review questions)

### Enables
- 008-admin-bank-stats (stats include review queue count)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Approving already-active question | Idempotent — return 200 with current state |
| Rejecting already-rejected question | Idempotent — return 200 |
| Editing and approving | Both update text and set active atomically |

## Out of Scope

- Bulk approve/reject (approve one at a time in v1)
