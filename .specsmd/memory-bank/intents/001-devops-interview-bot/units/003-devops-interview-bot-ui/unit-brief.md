---
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: 2026-03-06T00:00:00.000Z
updated: 2026-03-06T00:00:00.000Z
---

# Unit Brief: DevOps Interview Bot UI

## Purpose

The frontend application for the DevOps Interview Bot — all user-facing pages and interactions including session setup, question delivery, answer reveal, self-rating, session history, and admin question management.

## Scope

### In Scope
- Session setup page: topic selector, difficulty slider, experience picker, question count
- Interview page: question display, reveal answer button, self-rating widget, navigation
- Session history page: list of past sessions with metadata
- Session review page: re-open past session, browse questions/answers/ratings
- Admin page: question bank stats, bulk generation trigger, review/approve/reject queue

### Out of Scope
- Backend business logic (owned by question-bank-service, interview-session-service)
- Question generation (owned by question-bank-service)
- Data persistence (owned by backend services)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Session configuration UI | Must |
| FR-2 | Question delivery UI | Must |
| FR-4 | Answer reveal UI | Must |
| FR-5 | Self-rating UI | Must |
| FR-6 | Session history and review UI | Must |
| FR-7 | Admin question management UI | Should |

---

## Domain Concepts

### Key Pages / Components

| Component | Description |
|-----------|-------------|
| SessionSetupPage | Form to configure a new interview session |
| InterviewPage | Active interview: question, reveal, rating, progress |
| SessionHistoryPage | Paginated list of the user's past sessions |
| SessionReviewPage | Read-only view of a completed session |
| AdminQuestionPage | Admin-only: bank stats, generation, review queue |

### Key UI Interactions

| Interaction | Description |
|-------------|-------------|
| Topic multi-select | Checkbox group for 8 DevOps topics |
| Difficulty slider | 1-5 range with labels (Beginner → Expert) |
| Experience selector | Junior / Mid / Senior radio or segmented control |
| Question counter | Progress indicator (e.g., "Question 3 of 10") |
| Reveal answer button | Shows answer+explanation below the question |
| Self-rating widget | 1-5 star/button rating, skippable |
| Session history list | Card list with date, topics, difficulty, score |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 5 |
| Should Have | 2 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-session-setup-ui | Session setup form | Must | Planned |
| 002-interview-question-ui | Interview question display and navigation | Must | Planned |
| 003-answer-reveal-ui | Answer reveal interaction | Must | Planned |
| 004-self-rating-ui | Self-rating widget after reveal | Must | Planned |
| 005-session-history-ui | Session history list page | Must | Planned |
| 006-session-review-ui | Session review page | Should | Planned |
| 007-admin-question-management-ui | Admin question bank management page | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-question-bank-service | Admin question management API |
| 002-interview-session-service | All session and question delivery APIs |

### Depended By
| Unit | Reason |
|------|--------|
| None | Leaf node |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | All data via internal API | - |

---

## Technical Context

### Suggested Technology
- Next.js App Router pages and layouts
- shadcn/ui components (Select, Slider, RadioGroup, Button, Card, Badge, Progress)
- Tailwind CSS for styling
- React hooks for local state management

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| /api/v1/sessions/ | REST | JSON (JSend) |
| /api/v1/questions/ | REST | JSON (JSend) |

### Data Storage
| Data | Type | Notes |
|------|------|-------|
| Active session state | React state / URL params | Not persisted client-side |

---

## Constraints

- Admin page must be gated behind admin role check (middleware)
- Desktop-first layout (per UX guide)
- All API calls must handle loading and error states

---

## Success Criteria

### Functional
- [ ] User can configure and start a session from the UI
- [ ] Questions displayed one at a time with progress indicator
- [ ] Answer reveal works on demand, shown below question
- [ ] Self-rating widget works and is skippable
- [ ] Session history lists all past sessions
- [ ] Session review shows full past session details

### Non-Functional
- [ ] Pages load < 500ms
- [ ] WCAG 2.1 AA compliance on all interactive elements

### Quality
- [ ] Vitest tests for key components
- [ ] Playwright E2E test for core interview flow

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 007-devops-interview-bot-ui | Simple | 001, 002, 003, 004 | Setup form + interview flow + reveal + rating |
| 008-devops-interview-bot-ui | Simple | 005, 006, 007 | Session history + review + admin page |
