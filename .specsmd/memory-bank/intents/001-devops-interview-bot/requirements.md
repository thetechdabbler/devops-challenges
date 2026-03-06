---
intent: 001-devops-interview-bot
phase: inception
status: complete
created: 2026-03-05T00:00:00.000Z
updated: 2026-03-05T00:00:00.000Z
---

# Requirements: DevOps Interview Bot

## Intent Overview

An AI-powered mock interview bot for DevOps roles, accessible to authenticated users. Users select topics from the DevOps curriculum (Docker, Kubernetes, CI/CD, Ansible, IaC, Observability, AWS), choose a difficulty level (1–5) and experience level, then receive a mixed set of theory and scenario-based interview questions. Questions are sourced from a hybrid pre-generated bank (backed by OpenAI) and served per session. Users can reveal answers with explanations and self-rate their performance. Sessions are persisted for review and history.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Help users prepare for DevOps interviews | Users complete at least one full session | Must |
| Cover broad topic range from the DevOps curriculum | Questions span all 8 topic areas | Must |
| Provide high-quality, unique questions | < 5% duplicate questions per session | Must |
| Enable self-assessment | Users can rate responses and review sessions | Should |
| Support continuous question bank growth via AI | New questions generated when bank coverage is low | Should |

---

## Functional Requirements

### FR-1: Topic & Session Configuration
- **Description**: User must be able to configure an interview session by selecting one or more DevOps topics, a difficulty level (1–5), and an experience level (Junior / Mid / Senior)
- **Acceptance Criteria**:
  - Topics selectable: Docker, Kubernetes, CI/CD, Ansible, IaC/Terraform, Observability, AWS, General DevOps
  - Difficulty selectable: 1 (Beginner) to 5 (Expert)
  - Experience levels: Junior, Mid-level, Senior
  - Session cannot start without at least one topic selected
- **Priority**: Must

### FR-2: Question Delivery
- **Description**: System delivers a sequence of interview questions — a mix of theory and scenario-based — matching the user's session configuration
- **Acceptance Criteria**:
  - Questions are presented one at a time
  - Each session contains 5–20 questions (user-configurable)
  - Mix: at least 30% scenario-based, at least 30% theory-based
  - No duplicate questions within a single session
  - Questions are relevant to selected topics, difficulty, and experience level
- **Priority**: Must

### FR-3: Hybrid Question Bank
- **Description**: Questions are served from a pre-generated database. OpenAI generates new questions when the bank has insufficient coverage for a given topic/difficulty/experience combination
- **Acceptance Criteria**:
  - Questions stored in DB with topics[] (multi-topic array), difficulty, type (theory/scenario), and experience level metadata
  - If available questions for a config < session size requested, OpenAI generates the gap
  - Generated questions are saved to the bank for future reuse
  - Question uniqueness enforced per user session (no repeats from prior sessions within 30 days)
- **Priority**: Must

### FR-4: Answer Reveal
- **Description**: User can reveal the answer and explanation for any question on demand
- **Acceptance Criteria**:
  - "Reveal Answer" action available on every question
  - Answer includes: correct answer + detailed explanation + key concepts covered
  - Answer visible only after user explicitly requests it
- **Priority**: Must

### FR-5: Self-Rating
- **Description**: After revealing an answer, user can rate their own response on a 1–5 scale
- **Acceptance Criteria**:
  - Rating prompt appears after answer is revealed
  - Scale: 1 (Missed it), 2 (Partial), 3 (Got the gist), 4 (Good), 5 (Nailed it)
  - Rating is stored against the question in the session
  - Rating is optional — user can skip
- **Priority**: Must

### FR-6: Session Persistence & History
- **Description**: Interview sessions are saved and accessible from a history view
- **Acceptance Criteria**:
  - Session saved automatically when started
  - Session record includes: date, topics, difficulty, experience level, questions asked, answers revealed, self-ratings
  - User can view a list of past sessions
  - User can re-open a past session to review questions, answers, and ratings
  - Sessions are private to the authenticated user
- **Priority**: Must

### FR-7: Admin Question Management (AI Population)
- **Description**: An admin interface or background job to populate and manage the question bank using OpenAI
- **Acceptance Criteria**:
  - Admin can trigger bulk question generation for a topic/difficulty/experience combo
  - Generated questions are reviewed (flagged for review) before becoming active
  - Admin can approve, edit, or reject generated questions
  - Question bank stats visible: count per topic/difficulty/type
- **Priority**: Should

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Question load time | p95 latency | < 500ms |
| AI generation fallback | Time to generate question | < 5s |
| Session save | Write latency | < 200ms |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Authentication | JWT + GitHub OAuth | All routes behind auth middleware |
| Data isolation | Per-user scoping | Sessions and ratings visible only to owner |
| API key protection | Server-side only | OpenAI API key never exposed to client |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Availability | Uptime | 99% |
| AI fallback | Graceful degradation | If OpenAI unavailable, serve from bank only |

---

## Constraints

### Technical Constraints
- OpenAI API used exclusively for question generation (no other LLM providers)
- Questions must reference concepts covered in the DevOps curriculum at `devops-challenges/`
- All routes behind GitHub OAuth + JWT authentication

### Business Constraints
- OpenAI API costs must be managed — bulk generation should be admin-triggered, not automatic

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| OpenAI API is reliable for question generation | Sessions degrade to bank-only if API is down | Graceful fallback to existing bank |
| Users are comfortable with self-rating | Low engagement with rating feature | Make rating optional |
| DevOps curriculum covers sufficient breadth for questions | Narrow question pool for some topics | Admin can trigger targeted generation |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Should there be a leaderboard or social comparison feature? | Product | TBD | Pending |
| Should sessions have a time limit per question? | Product | TBD | Pending — excluded from v1 |
