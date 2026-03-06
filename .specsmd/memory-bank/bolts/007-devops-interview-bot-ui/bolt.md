---
id: 007-devops-interview-bot-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
type: simple-construction-bolt
status: complete
started: 2026-03-06T05:16:45.000Z
stages_completed:
  - name: plan
    completed: 2026-03-06T05:23:18.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-06T05:23:18.000Z
    artifact: portal/frontend/src/api/interview.api.ts, portal/frontend/src/pages/InterviewSetupPage.tsx, portal/frontend/src/pages/InterviewSessionPage.tsx, portal/frontend/src/components/interview/SessionSetupForm.tsx, portal/frontend/src/components/interview/QuestionCard.tsx, portal/frontend/src/components/interview/AnswerReveal.tsx, portal/frontend/src/components/interview/SelfRating.tsx, portal/frontend/src/App.tsx, portal/frontend/src/components/Layout.tsx, implementation-walkthrough.md
  - name: test
    completed: 2026-03-06T05:24:26.000Z
    artifact: test-walkthrough.md
current_stage: null
stories:
  - 001-session-setup-ui
  - 002-interview-question-ui
  - 003-answer-reveal-ui
  - 004-self-rating-ui
created: 2026-03-06T00:00:00.000Z
requires_bolts:
  - 004-interview-session-service
  - 005-interview-session-service
  - 006-interview-session-service
enables_bolts:
  - 008-devops-interview-bot-ui
requires_units:
  - 001-question-bank-service
  - 002-interview-session-service
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 3
completed: "2026-03-06T06:00:38Z"
---

## Bolt: 007-devops-interview-bot-ui

### Objective
Build the core interview flow UI: session setup form, active question display, answer reveal interaction, and self-rating widget. End-to-end user journey from setup to rating.

### Stories Included

- [ ] **001-session-setup-ui**: /interview/new — topic/difficulty/experience/count form — Priority: Must
- [ ] **002-interview-question-ui**: /interview/:sessionId — question display with progress — Priority: Must
- [ ] **003-answer-reveal-ui**: Reveal answer interaction with fade-in animation — Priority: Must
- [ ] **004-self-rating-ui**: 1-5 rating widget with Skip & Next — Priority: Must

### Expected Outputs
- `app/(protected)/interview/new/page.tsx`
- `app/(protected)/interview/[sessionId]/page.tsx`
- `components/interview/SessionSetupForm.tsx`
- `components/interview/QuestionCard.tsx`
- `components/interview/AnswerReveal.tsx`
- `components/interview/SelfRating.tsx`
- Playwright E2E test: full interview flow (setup → question → reveal → rate)

### Dependencies

#### Bolt Dependencies (within intent)
- **004-interview-session-service** (Required): POST /sessions, GET current question
- **005-interview-session-service** (Required): POST reveal
- **006-interview-session-service** (Required): POST rate

#### Unit Dependencies (cross-unit)
- **001-question-bank-service**: Complete (hybrid question bank operational)
- **002-interview-session-service**: Complete (all session APIs available)

#### Enables (other bolts waiting on this)
- 008-devops-interview-bot-ui (history + admin pages)
