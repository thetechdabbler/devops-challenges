---
intent: 001-devops-interview-bot
created: 2026-03-05T00:00:00Z
completed: 2026-03-06T00:00:00Z
status: complete
---

# Inception Log: DevOps Interview Bot

## Overview

**Intent**: AI-powered mock interview bot for DevOps roles — topic/difficulty/experience selection, hybrid question bank, answer reveal, self-rating, session history
**Type**: green-field
**Created**: 2026-03-05

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| System Context | ✅ | system-context.md |
| Units | ✅ | units.md |
| Unit Brief — question-bank-service | ✅ | units/001-question-bank-service/unit-brief.md |
| Unit Brief — interview-session-service | ✅ | units/002-interview-session-service/unit-brief.md |
| Unit Brief — devops-interview-bot-ui | ✅ | units/003-devops-interview-bot-ui/unit-brief.md |
| Stories — question-bank-service | ✅ | units/001-question-bank-service/stories/ (8 stories) |
| Stories — interview-session-service | ✅ | units/002-interview-session-service/stories/ (9 stories) |
| Stories — devops-interview-bot-ui | ✅ | units/003-devops-interview-bot-ui/stories/ (7 stories) |
| Bolt Plan | ✅ | memory-bank/bolts/ (8 bolts) |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 7 |
| Non-Functional Requirements | 6 |
| Units | 3 |
| Stories | 24 |
| Bolts Planned | 8 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-question-bank-service | 8 | 3 | Must |
| 002-interview-session-service | 9 | 3 | Must |
| 003-devops-interview-bot-ui | 7 | 2 | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-03-05 | Hybrid question bank (pre-generated + on-the-fly) | Balance cost/latency vs freshness | Yes |
| 2026-03-05 | OpenAI for question generation | User preference | Yes |
| 2026-03-05 | Auth required for all routes | Privacy of sessions and ratings | Yes |
| 2026-03-05 | Self-rating (1–5 scale) over AI-evaluated feedback | Simpler v1, user-driven | Yes |
| 2026-03-05 | Sessions persisted per user | Enable history and review | Yes |
| 2026-03-06 | 3 units: question-bank-service, interview-session-service, devops-interview-bot-ui | Clean DDD domain separation; frontend is independent deployable | Yes |
| 2026-03-06 | Admin bulk generation saves as pending_review; session gap-fill saves as active | Admin controls quality; sessions must not be blocked by review queue | Yes |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-03-06 | Changed question `topic` (single enum) → `topics[]` (multi-topic array) via junction table | Support cross-topic questions e.g. Docker+Kubernetes | Schema change: add question_topics junction table; query updated to JOIN + DISTINCT; story 001 and 002 updated |

## Ready for Construction

**Checklist**:
- [x] Requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned
- [x] Human review complete

## Next Steps

1. Complete Checkpoint 3 (Artifacts Review)
2. If approved — begin Construction Phase
3. Start with Unit: 001-question-bank-service
4. Execute: `/specsmd-construction-agent --unit="001-question-bank-service"`

## Dependencies

```
001-question-bank-service (bolts 001, 002, 003)
        │
        ▼
002-interview-session-service (bolts 004, 005, 006)
        │
        ▼
003-devops-interview-bot-ui (bolts 007, 008)
```
