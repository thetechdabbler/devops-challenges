---
unit: 002-interview-session-service
intent: 001-devops-interview-bot
phase: inception
status: complete
created: 2026-03-06T00:00:00.000Z
updated: 2026-03-06T00:00:00.000Z
---

# Unit Brief: Interview Session Service

## Purpose

Manages the full lifecycle of a mock interview session — from configuration and question delivery to answer reveal, self-rating, and session history. Orchestrates question retrieval from the question bank and persists all session data per authenticated user.

## Scope

### In Scope
- Session entity: creation, configuration, persistence
- Question delivery: fetching an ordered sequence from question-bank-service
- Enforcing question mix (≥30% theory, ≥30% scenario)
- Answer reveal: returning answer + explanation on demand
- Self-rating: storing user's 1-5 rating per question per session
- Session history: list past sessions, re-open and review a session

### Out of Scope
- Question storage and AI generation (owned by question-bank-service)
- Admin question management (owned by question-bank-service)
- Frontend UI (owned by devops-interview-bot-ui)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Topic & session configuration | Must |
| FR-2 | Question delivery (ordered, mixed types, no dupes) | Must |
| FR-4 | Answer reveal on demand | Must |
| FR-5 | Self-rating (1–5, optional) | Must |
| FR-6 | Session persistence and history | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| Session | A single interview session | id, user_id, topics[], difficulty, experience_level, question_count, status (in-progress/completed), created_at, completed_at |
| SessionQuestion | A question within a session | id, session_id, question_id, sequence_order, answer_revealed, self_rating (1-5 or null) |
| SessionConfig | Value object for session setup | topics[], difficulty (1-5), experience_level, question_count (5-20) |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| createSession | Create new session from config, fetch questions | SessionConfig, user_id | Session with ordered questions |
| getNextQuestion | Return the next un-answered question in session | session_id, user_id | SessionQuestion + Question |
| revealAnswer | Mark question answered and return answer+explanation | session_id, question_id | Answer + explanation |
| submitRating | Store self-rating for a revealed question | session_id, question_id, rating (1-5) | Updated SessionQuestion |
| listSessions | Return paginated session history for user | user_id, cursor, limit | Session[] + nextCursor |
| getSessionDetail | Return full session with all questions, reveals, ratings | session_id, user_id | Session + SessionQuestion[] |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 9 |
| Must Have | 9 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-session-configuration | User configures a session | Must | Planned |
| 002-session-created-and-persisted | Session created and persisted on start | Must | Planned |
| 003-question-delivery-in-sequence | Questions delivered in sequence | Must | Planned |
| 004-mixed-question-types | Question mix enforced (≥30% each type) | Must | Planned |
| 005-no-duplicates-in-session | No duplicate questions within session | Must | Planned |
| 006-answer-reveal | User reveals answer on demand | Must | Planned |
| 007-self-rating | User self-rates after reveal | Must | Planned |
| 008-session-history-list | User views list of past sessions | Must | Planned |
| 009-session-review | User re-opens and reviews a past session | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-question-bank-service | Needs question retrieval API |

### Depended By
| Unit | Reason |
|------|--------|
| 003-devops-interview-bot-ui | Consumes all session APIs |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | No direct external dependencies | - |

---

## Technical Context

### Suggested Technology
- Drizzle ORM with SQLite
- Internal service call to question-bank-service (same Next.js app, via lib import or API route)

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| question-bank-service | Internal | Direct lib call within monolith |
| devops-interview-bot-ui | Internal API | Next.js API routes (`/api/v1/sessions/`) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Sessions | SQLite | Per user × sessions | Permanent |
| SessionQuestions | SQLite | sessions × question count | Permanent |

---

## Constraints

- Session data is user-scoped — no user can access another user's sessions
- question_count must be between 5 and 20 (validated on session create)
- Rating is optional — null is a valid state for unrevealed or skipped ratings

---

## Success Criteria

### Functional
- [ ] Session created with correct config and question sequence
- [ ] Question mix constraint met (≥30% theory, ≥30% scenario)
- [ ] No duplicates within session
- [ ] Answers only returned after explicit reveal action
- [ ] Self-rating stored correctly and skippable
- [ ] Session history paginated and user-scoped
- [ ] Past sessions fully reviewable

### Non-Functional
- [ ] Session creation < 500ms p95 (including question fetch)
- [ ] Session writes < 200ms

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 004-interview-session-service | DDD | 001, 002, 003 | Session domain model + config + creation + question delivery |
| 005-interview-session-service | DDD | 004, 005, 006 | Question mix + dedup + answer reveal |
| 006-interview-session-service | DDD | 007, 008, 009 | Self-rating + session history + session review |
