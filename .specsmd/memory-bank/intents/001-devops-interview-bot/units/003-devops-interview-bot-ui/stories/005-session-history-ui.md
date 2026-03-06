---
id: 005-session-history-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 008-devops-interview-bot-ui
implemented: true
---

# Story: 005-session-history-ui

## User Story

**As an** authenticated user
**I want** to see a list of my past interview sessions
**So that** I can track my practice history and choose sessions to review

## Acceptance Criteria

- [ ] **Given** I navigate to /interview/history, **When** the page loads, **Then** I see a list of my sessions as cards, ordered by most recent first
- [ ] **Given** sessions are displayed, **When** I view each card, **Then** I see: date, topics (as badges), difficulty, experience level, question count, and average self-rating (if rated)
- [ ] **Given** I have no sessions, **When** the page loads, **Then** I see an empty state with a "Start your first interview" CTA
- [ ] **Given** I click on a session card, **When** the click registers, **Then** I am navigated to /interview/history/:sessionId
- [ ] **Given** many sessions exist, **When** I scroll to the bottom, **Then** more sessions load (infinite scroll or "Load more" button)

## Technical Notes

- Route: app/(protected)/interview/history/page.tsx
- Fetch from GET /api/v1/sessions?limit=10
- Each session = shadcn Card component
- Average rating displayed as "Avg: 3.8/5" or "Not rated"
- Cursor-based pagination with "Load more" button

## Dependencies

### Requires
- 001-session-setup-ui (user needs at least one session)

### Enables
- 006-session-review-ui

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| In-progress session in history | Card shows "In Progress" badge, click resumes |

## Out of Scope

- Filtering or searching sessions
