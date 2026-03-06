# Global Story Index

## Overview
- **Total stories**: 44
- **Generated**: 44 ✅
- **Last updated**: 2026-03-06

---

## Stories by Intent

### 001-devops-interview-bot

#### Unit: 001-question-bank-service

- [x] **001-question-schema-and-storage** ✅ GENERATED — Question DB schema and storage — Must — Planned
- [x] **002-question-lookup-by-config** ✅ GENERATED — Question lookup by topic/difficulty/experience — Must — Planned
- [x] **003-openai-question-generation** ✅ GENERATED — OpenAI question generation — Must — Planned
- [x] **004-generated-question-saved-to-bank** ✅ GENERATED — Generated questions saved to bank — Must — Planned
- [x] **005-question-deduplication** ✅ GENERATED — Question deduplication per user (30-day) — Must — Planned
- [x] **006-admin-bulk-generation** ✅ GENERATED — Admin triggers bulk generation — Should — Planned
- [x] **007-admin-review-approve-reject** ✅ GENERATED — Admin reviews and approves/rejects questions — Should — Planned
- [x] **008-admin-bank-stats** ✅ GENERATED — Admin views bank statistics — Should — Planned

#### Unit: 002-interview-session-service

- [x] **001-session-configuration** ✅ GENERATED — User configures a session — Must — Planned
- [x] **002-session-created-and-persisted** ✅ GENERATED — Session created and persisted on start — Must — Planned
- [x] **003-question-delivery-in-sequence** ✅ GENERATED — Questions delivered in sequence — Must — Planned
- [x] **004-mixed-question-types** ✅ GENERATED — Question mix enforced (≥30% each type) — Must — Planned
- [x] **005-no-duplicates-in-session** ✅ GENERATED — No duplicate questions within session — Must — Planned
- [x] **006-answer-reveal** ✅ GENERATED — User reveals answer on demand — Must — Planned
- [x] **007-self-rating** ✅ GENERATED — User self-rates after reveal — Must — Planned
- [x] **008-session-history-list** ✅ GENERATED — User views list of past sessions — Must — Planned
- [x] **009-session-review** ✅ GENERATED — User re-opens and reviews a past session — Must — Planned

#### Unit: 003-devops-interview-bot-ui

- [x] **001-session-setup-ui** ✅ GENERATED — Session setup form — Must — Planned
- [x] **002-interview-question-ui** ✅ GENERATED — Interview question display and navigation — Must — Planned
- [x] **003-answer-reveal-ui** ✅ GENERATED — Answer reveal interaction — Must — Planned
- [x] **004-self-rating-ui** ✅ GENERATED — Self-rating widget after reveal — Must — Planned
- [x] **005-session-history-ui** ✅ GENERATED — Session history list page — Must — Planned
- [x] **006-session-review-ui** ✅ GENERATED — Session review page — Should — Planned
- [x] **007-admin-question-management-ui** ✅ GENERATED — Admin question bank management page — Should — Planned

### 002-interview-question-import-export

#### Unit: 001-question-transfer-service

- [x] **001-export-questions-csv** ✅ GENERATED — Export question bank as CSV — Must — Planned
- [x] **002-import-dry-run-validation** ✅ GENERATED — Import dry-run validation report — Must — Planned
- [x] **003-idempotent-dedup-logic** ✅ GENERATED — Idempotent deduplication for import apply — Must — Planned
- [x] **004-import-apply-persistence** ✅ GENERATED — Persist valid rows with transactional safety — Must — Planned
- [x] **005-import-error-reporting** ✅ GENERATED — Row-level error reporting and summary metrics — Must — Planned
- [x] **006-import-api-contract** ✅ GENERATED — API contract for import/export workflows — Must — Planned

#### Unit: 002-question-transfer-ui

- [x] **001-import-export-module-entry** ✅ GENERATED — Import/export module access for authenticated users — Must — Planned
- [x] **002-export-filters-and-download** ✅ GENERATED — Export filters and CSV download action — Must — Planned
- [x] **003-import-upload-and-mode** ✅ GENERATED — File upload with dry-run/apply modes — Must — Planned
- [x] **004-import-reporting-ui** ✅ GENERATED — Validation/apply summary and row-level error display — Must — Planned

### 003-admin-question-management

#### Unit: 001-reviewer-question-management-service

- [x] **001-reviewer-role-access-control** ✅ GENERATED — Reviewer role access enforcement — Must — Planned
- [x] **002-create-question-validation** ✅ GENERATED — Create question with strict validation — Must — Planned
- [x] **003-update-question-with-version-check** ✅ GENERATED — Update with stale-write conflict protection — Must — Planned
- [x] **004-soft-delete-question** ✅ GENERATED — Archive question with idempotent delete behavior — Must — Planned
- [x] **005-list-filtered-questions** ✅ GENERATED — Filtered paginated listing for reviewer operations — Must — Planned
- [x] **006-audit-trail-recording** ✅ GENERATED — Immutable audit events for CRUD actions — Must — Planned

#### Unit: 002-reviewer-question-management-ui

- [x] **001-reviewer-module-entry** ✅ GENERATED — Reviewer navigation and module entry — Must — Planned
- [x] **002-question-form-create-edit** ✅ GENERATED — Create/edit form UX with validation display — Must — Planned
- [x] **003-delete-confirmation-and-archive** ✅ GENERATED — Archive confirmation safeguards — Must — Planned
- [x] **004-conflict-and-stale-data-recovery** ✅ GENERATED — Handle stale-data conflicts and refresh flow — Must — Planned

---

## Stories by Status

- **Planned / Generated**: 44
- **In Progress**: 0
- **Completed**: 0
