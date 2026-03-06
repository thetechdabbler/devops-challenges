---
stage: plan
bolt: 008-devops-interview-bot-ui
created: 2026-03-06T06:01:14Z
---

## Implementation Plan: devops-interview-bot-ui (History + Admin)

### Objective
Complete the remaining frontend surfaces for the interview bot: session history, session review, and admin question bank management, using the existing React + Vite + React Router architecture.

### Deliverables
- `portal/frontend/src/pages/InterviewHistoryPage.tsx` - paginated history list with load-more.
- `portal/frontend/src/pages/InterviewReviewPage.tsx` - full session review detail for selected session.
- `portal/frontend/src/pages/AdminQuestionsPage.tsx` - admin dashboard for stats, generation, review queue.
- `portal/frontend/src/components/interview/SessionHistoryCard.tsx` - session summary card UI.
- `portal/frontend/src/components/interview/SessionReview.tsx` - read-only question/answer/rating list UI.
- `portal/frontend/src/components/admin/QuestionBankStats.tsx` - stats cards by topic/difficulty/status.
- `portal/frontend/src/components/admin/GenerationForm.tsx` - generation form for admin question creation.
- `portal/frontend/src/components/admin/ReviewQueue.tsx` - pending review list with approve/reject actions.
- `portal/frontend/src/api/admin.api.ts` - typed admin endpoints (generate, stats, list, review).
- Extend `portal/frontend/src/api/interview.api.ts` with:
  - history list (`GET /api/v1/sessions`)
  - session detail (`GET /api/v1/sessions/:id`)
- Route wiring in `portal/frontend/src/App.tsx`:
  - `/interview/history`
  - `/interview/history/:sessionId`
  - `/admin/questions`

### Dependencies
- Backend APIs already available:
  - `GET /api/v1/sessions?cursor=&limit=`
  - `GET /api/v1/sessions/:id`
  - `GET /api/v1/admin/questions/stats`
  - `POST /api/v1/admin/questions/generate`
  - `GET /api/v1/admin/questions`
  - `PATCH /api/v1/admin/questions/:id`
- Bolt `007` core interview routes/components complete.
- User role available in auth payload and backend middleware enforces admin access.

### Technical Approach
1. Add API client methods for history/review/admin contracts.
2. Implement history page with cursor pagination and empty state CTA.
3. Implement review page that renders full answers and ratings read-only.
4. Implement admin page with three sections:
   - stats
   - generation form
   - review queue with approve/reject actions
5. Handle 403/401 responses with redirect fallback on admin page.
6. Keep component styles consistent with existing portal inline-style approach.

### Acceptance Criteria
- [ ] `/interview/history` lists sessions newest-first with required metadata and load-more pagination.
- [ ] Empty history shows a clear start-interview CTA.
- [ ] Clicking a history item navigates to `/interview/history/:sessionId`.
- [ ] `/interview/history/:sessionId` displays session summary and full ordered question review.
- [ ] `/admin/questions` shows stats, generation controls, and pending review queue.
- [ ] Approve/reject actions update queue state without full page refresh.
- [ ] Non-admin users are blocked from admin page path with graceful redirect messaging.
- [ ] Frontend build (`npm run build`) passes with new pages/components.
