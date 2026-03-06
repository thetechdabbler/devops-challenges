---
intent: 001-devops-interview-bot
phase: inception
status: draft
created: 2026-03-06T00:00:00Z
updated: 2026-03-06T00:00:00Z
---

# Units: DevOps Interview Bot

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-3 | Hybrid Question Bank | 001-question-bank-service |
| FR-7 | Admin Question Management | 001-question-bank-service |
| FR-1 | Topic & Session Configuration | 002-interview-session-service |
| FR-2 | Question Delivery | 002-interview-session-service |
| FR-4 | Answer Reveal | 002-interview-session-service |
| FR-5 | Self-Rating | 002-interview-session-service |
| FR-6 | Session Persistence & History | 002-interview-session-service |
| FR-1 to FR-7 (UI) | All user-facing interactions | 003-devops-interview-bot-ui |

---

## Units

### Unit 001: question-bank-service
- **Purpose**: Owns the question bank — storage, retrieval, and AI-powered generation of DevOps interview questions
- **Responsibility**: Single source of truth for all questions; decides when to serve from bank vs. generate via OpenAI
- **Assigned Requirements**: FR-3, FR-7
- **Type**: backend (DDD)
- **Dependencies**: None
- **Depended By**: 002-interview-session-service

### Unit 002: interview-session-service
- **Purpose**: Manages the full interview session lifecycle — configuration, question serving, answer reveal, self-rating, and session history
- **Responsibility**: Orchestrates question delivery from the question bank, persists sessions, stores ratings
- **Assigned Requirements**: FR-1, FR-2, FR-4, FR-5, FR-6
- **Type**: backend (DDD)
- **Dependencies**: 001-question-bank-service
- **Depended By**: 003-devops-interview-bot-ui

### Unit 003: devops-interview-bot-ui
- **Purpose**: Frontend application — all user-facing pages and interactions for the interview bot feature
- **Responsibility**: Session setup form, question/answer UI, self-rating, session history, admin question management
- **Assigned Requirements**: FR-1 through FR-7 (UI layer)
- **Type**: frontend (Simple)
- **Dependencies**: 001-question-bank-service, 002-interview-session-service
- **Depended By**: None

---

## Dependency Graph

```
001-question-bank-service
        │
        ▼
002-interview-session-service
        │
        ▼
003-devops-interview-bot-ui
```

## Execution Order

1. `001-question-bank-service` — must be complete first (no dependencies)
2. `002-interview-session-service` — requires question bank service
3. `003-devops-interview-bot-ui` — requires both backend units
