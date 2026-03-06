---
stage: plan
bolt: 007-devops-interview-bot-ui
created: 2026-03-06T05:16:45Z
---

## Implementation Plan: devops-interview-bot-ui (Core Flow)

### Objective
Deliver the authenticated core interview UI flow: session setup, active interview question screen, answer reveal interaction, and self-rating actions, wired to the completed backend session APIs.

### Deliverables
- `portal/frontend/src/pages/InterviewSetupPage.tsx` - setup form for topics, difficulty, experience, question count.
- `portal/frontend/src/pages/InterviewSessionPage.tsx` - active interview page for current question flow.
- `portal/frontend/src/components/interview/SessionSetupForm.tsx` - reusable setup form UI and validation.
- `portal/frontend/src/components/interview/QuestionCard.tsx` - question display with progress and metadata.
- `portal/frontend/src/components/interview/AnswerReveal.tsx` - reveal button and answer/explanation/key-concepts section.
- `portal/frontend/src/components/interview/SelfRating.tsx` - 1-5 rating actions plus skip/next flow controls.
- `portal/frontend/src/api/interview.api.ts` - typed client for `/api/v1/sessions` create/current/reveal/rate calls.
- `portal/frontend/src/__tests__/interview-flow.ui.test.tsx` - component/integration tests for core interactions.
- Route updates in `portal/frontend/src/App.tsx` for `/interview/new` and `/interview/:sessionId`.

### Dependencies
- `002-interview-session-service` APIs are complete:
  - `POST /api/v1/sessions`
  - `GET /api/v1/sessions/:id/questions/current`
  - `POST /api/v1/sessions/:sessionId/questions/:questionId/reveal`
  - `POST /api/v1/sessions/:sessionId/questions/:questionId/rate`
- Existing frontend stack is React + Vite + React Router (not Next.js App Router), so story route intent will be implemented using current router/page structure.
- Existing auth guard via `ProtectedRoute` and shell layout via `Layout` will be reused.

### Technical Approach
Implement a route-driven flow under protected routes:
1. Setup page posts session config and navigates to session page by returned `session_id`.
2. Session page fetches current question and renders progress + metadata.
3. Reveal component posts reveal action and animates answer card.
4. Self-rating component posts selected rating (or skip) and then reloads next question.
5. On completed status, show session complete state with navigation to history (or units until history page is built).

Use small focused components to keep behavior testable and maintainable. Keep state local to interview pages/components; avoid introducing global state unless needed.

### Acceptance Criteria
- [ ] `/interview/new` shows full configuration form with inline validation and loading state.
- [ ] Valid setup submits to session create API and navigates to `/interview/:sessionId`.
- [ ] `/interview/:sessionId` shows current question with "Question N of Total".
- [ ] Reveal action displays answer, explanation, and key concepts with visible transition.
- [ ] Rating actions support 1-5 submit and skip path; re-rate works when clicked again.
- [ ] Error responses from create/reveal/rate are surfaced to user (inline/toast/banner).
- [ ] Interview flow tests cover setup submit, reveal, rating, and next-question progression.
