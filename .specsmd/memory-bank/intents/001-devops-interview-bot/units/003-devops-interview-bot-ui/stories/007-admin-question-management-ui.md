---
id: 007-admin-question-management-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: should
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 008-devops-interview-bot-ui
implemented: true
---

# Story: 007-admin-question-management-ui

## User Story

**As an** admin
**I want** a dashboard to manage the question bank — view stats, generate questions, and review/approve/reject AI-generated questions
**So that** I can maintain a high-quality, broad question bank

## Acceptance Criteria

- [ ] **Given** I am an admin and navigate to /admin/questions, **When** the page loads, **Then** I see bank stats: total active questions broken down by topic and difficulty
- [ ] **Given** I am on the admin page, **When** I fill the generation form and click "Generate", **Then** a POST to /api/v1/admin/questions/generate is made and results shown
- [ ] **Given** pending questions exist, **When** the review queue section loads, **Then** I see each pending question with "Approve" and "Reject" buttons
- [ ] **Given** I click "Approve", **When** the API responds, **Then** the question is removed from the pending list and the active count increments
- [ ] **Given** I am not an admin, **When** I navigate to /admin/questions, **Then** I am redirected to /dashboard (403 handled by middleware)

## Technical Notes

- Route: app/(protected)/admin/questions/page.tsx
- Admin role check in middleware (not just client-side)
- Stats displayed as a grid of shadcn Cards (one per topic)
- Generation form: topic select, difficulty select, experience select, count input
- Review queue: scrollable list of pending questions with inline approve/reject

## Dependencies

### Requires
- 001-session-setup-ui (shared topic/difficulty/experience constants)

### Enables
- Full admin question management workflow

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Generation produces 0 questions | Show warning: "No questions generated — try a different config" |
| Empty review queue | Show "All caught up! No questions pending review" |

## Out of Scope

- Inline question editing (approve-only in v1)
- Bulk approve/reject
