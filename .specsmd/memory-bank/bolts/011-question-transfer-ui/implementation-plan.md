---
stage: plan
bolt: 011-question-transfer-ui
created: 2026-03-06T08:56:10Z
---

## Implementation Plan: question-transfer-ui

### Objective
Deliver an authenticated-user UI module for exporting and importing interview questions with dry-run/apply modes and actionable reporting.

### Deliverables
- New API client module for transfer endpoints (`export` and `import`).
- New page route for transfer module in protected app shell.
- Export filter controls and CSV download action.
- Import CSV input with mode toggle (`dry-run` default, `apply` optional).
- Result reporting UI with summary metrics and row-level validation issues.
- UI-level tests for page behavior and report rendering.

### Dependencies
- `010-question-transfer-service`: backend `GET /api/v1/questions/export` and `POST /api/v1/questions/import` must be available.
- Existing authenticated route shell (`ProtectedRoute`, `Layout`) for access control.

### Technical Approach
- Add `portal/frontend/src/api/question-transfer.api.ts` with typed request/response contracts.
- Add `portal/frontend/src/pages/QuestionTransferPage.tsx` using existing inline style pattern from interview/admin pages.
- Add route in `App.tsx` and top-nav entry in `Layout.tsx`.
- Download flow uses blob + object URL for CSV save.
- Import flow uses textarea for CSV payload in this iteration (backend currently accepts JSON body with csv string), plus mode selector and execute button.
- Render summary cards and issue list table with capped display for large issue sets.

### Acceptance Criteria
- [ ] Authenticated user can access transfer module route and see controls.
- [ ] Export filters trigger CSV download and handle empty/error states.
- [ ] Import supports dry-run and apply modes with clear loading/disabled state.
- [ ] Result summary shows total/valid/invalid/inserted/duplicate counts.
- [ ] Row-level error list includes row index and message.
- [ ] Core UI behaviors covered by component/API tests.
