---
last_updated: 2026-03-06T08:50:06Z
total_decisions: 16
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-016: Use Explicit Version Field for Optimistic Concurrency
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 012-reviewer-question-management-service (reviewer-question-management-service)
- **Path**: `bolts/012-reviewer-question-management-service/adr-016-use-explicit-version-field-for-optimistic-concurrency.md`
- **Summary**: Reviewer updates use explicit integer `version` as the optimistic concurrency token, not timestamps. Stale token mismatches return `409` with latest record metadata.
- **Read when**: Implementing reviewer update APIs; handling `409` conflict flows in UI; designing mutation concurrency patterns for question updates

### ADR-015: Append-Only Audit Table with Before/After Snapshots
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 012-reviewer-question-management-service (reviewer-question-management-service)
- **Path**: `bolts/012-reviewer-question-management-service/adr-015-append-only-audit-table-with-before-after-snapshots.md`
- **Summary**: Reviewer CRUD mutations are audited in an append-only `question_audit_events` table with actor, action, timestamp, and before/after snapshots. Mutation and audit writes should occur in one transactional boundary.
- **Read when**: Implementing or querying audit trails; adding new reviewer mutation endpoints; defining retention/indexing for audit data

### ADR-014: Reviewer Role as Explicit User Role
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 012-reviewer-question-management-service (reviewer-question-management-service)
- **Path**: `bolts/012-reviewer-question-management-service/adr-014-reviewer-role-as-explicit-user-role.md`
- **Summary**: The flat role enum is extended with explicit `reviewer` role and reviewer-only access checks, rather than mapping reviewer capabilities to `admin` or introducing full RBAC now.
- **Read when**: Changing user roles or auth claims; implementing reviewer-only routes; evaluating migration path from flat roles to RBAC

### ADR-013: Deterministic Fingerprint for Idempotent Imports
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 010-question-transfer-service (question-transfer-service)
- **Path**: `bolts/010-question-transfer-service/adr-013-deterministic-fingerprint-for-idempotent-imports.md`
- **Summary**: Apply-mode imports use deterministic row fingerprints (normalized text + metadata + sorted topics) as idempotency keys. Logically identical rows are treated as duplicates and skipped.
- **Read when**: Changing import normalization rules; debugging duplicate detection; extending idempotent behavior in transfer pipelines

### ADR-012: Single Import Endpoint with Explicit Mode
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 009-question-transfer-service (question-transfer-service)
- **Path**: `bolts/009-question-transfer-service/adr-012-single-import-endpoint-with-mode.md`
- **Summary**: Import uses one endpoint (`POST /api/v1/questions/import`) with explicit `mode` (`dry-run` or `apply`) to keep a stable contract and avoid endpoint sprawl.
- **Read when**: Modifying import API contracts; adding new import modes; updating frontend integration for import workflows

### ADR-011: Review Mode Always Returns Answer Content
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 006-interview-session-service (interview-session-service)
- **Path**: `bolts/006-interview-session-service/adr-011-review-mode-always-returns-answer-content.md`
- **Summary**: Session review endpoint always includes answer/explanation/key concepts for all questions regardless of reveal state. Reveal gating remains only in active interview flow.
- **Read when**: Working on session review payloads; implementing answer visibility rules; securing cross-user access checks in review endpoints

### ADR-010: Keyset Pagination for Session History
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 006-interview-session-service (interview-session-service)
- **Path**: `bolts/006-interview-session-service/adr-010-keyset-pagination-for-session-history.md`
- **Summary**: Session history uses keyset pagination with `(created_at, id)` cursor ordering for stable pages under concurrent inserts. Offset pagination is avoided.
- **Read when**: Updating session history listing; designing cursor pagination contracts; tuning DB query performance for history endpoints

### ADR-009: Session Auto-Completes on Last Reveal
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 005-interview-session-service (interview-session-service)
- **Path**: `bolts/005-interview-session-service/adr-009-session-auto-completes-on-last-reveal.md`
- **Summary**: Session status transitions from in_progress to completed as a side effect of the last answer reveal. No explicit completion endpoint exists. countUnrevealed == 0 after a reveal triggers completeSession().
- **Read when**: Implementing session history or status display; building session review UI; adding session timeout or abandonment logic; designing any feature that depends on session.status = completed

### ADR-008: Mix Enforcement Owned by question-bank-service
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 005-interview-session-service (interview-session-service)
- **Path**: `bolts/005-interview-session-service/adr-008-mix-enforcement-in-question-bank-service.md`
- **Summary**: The ≥30% theory/≥30% scenario mix constraint is enforced inside questionBankService.getQuestionsForSession, not in the session service. All callers of getQuestionsForSession automatically receive mix-balanced results. Type-targeted AI gap-fill is triggered per type when needed.
- **Read when**: Calling getQuestionsForSession from any context; adding a new question type; changing the mix ratio; building features that depend on question type distribution; debugging session question composition

### ADR-007: Session Created with Actual Question Count on Bank Gap
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 004-interview-session-service (interview-session-service)
- **Path**: `bolts/004-interview-session-service/adr-007-session-created-with-actual-question-count.md`
- **Summary**: When questionBankService returns fewer questions than requested (gapCount > 0), the session is created with the actual count rather than failing. `question_count` on Session reflects actual length; `gap_count` is included in the POST response.
- **Read when**: Implementing session creation logic; handling the POST /api/v1/sessions response shape; building client-side session setup UI that displays question count; adding monitoring or alerting around session quality

### ADR-006: Flat UserRole Enum Instead of RBAC Table
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 003-question-bank-service (question-bank-service)
- **Path**: `bolts/003-question-bank-service/adr-006-flat-role-enum-not-rbac.md`
- **Summary**: A single `role: user | admin` enum on the User model is used instead of a roles/permissions table. Adding a third role requires a schema migration. Only one role per user is supported.
- **Read when**: Adding new role types or permissions; implementing role-based feature flags; designing any access control beyond user/admin distinction; considering a migration to RBAC

### ADR-005: Admin Role Cached in JWT (Not Verified Per-Request from DB)
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 003-question-bank-service (question-bank-service)
- **Path**: `bolts/003-question-bank-service/adr-005-role-cached-in-jwt.md`
- **Summary**: The `role` field is embedded in the JWT at login. `requireAdmin` reads `req.user.role` with no DB query. Role changes take effect when the token expires (up to 24h). Emergency revocation: rotate `JWT_SECRET`.
- **Read when**: Implementing role checks or admin middleware; handling admin promotion/demotion; building token refresh or session invalidation; responding to a security incident requiring immediate access revocation

### ADR-004: Non-Fatal AI Degradation with gapCount Signal
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 002-question-bank-service (question-bank-service)
- **Path**: `bolts/002-question-bank-service/adr-004-non-fatal-ai-degradation.md`
- **Summary**: AI generation failures in `getQuestionsForSession` are non-fatal. The function returns available bank questions with `gapCount` set to the actual shortfall rather than throwing. Callers must handle `gapCount > 0` as a valid state.
- **Read when**: Implementing any caller of `getQuestionsForSession`; designing session creation logic; adding retry or fallback logic around AI generation; building monitoring or alerting for AI availability

### ADR-003: OpenAI Structured Output via json_schema Mode
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 002-question-bank-service (question-bank-service)
- **Path**: `bolts/002-question-bank-service/adr-003-openai-structured-output.md`
- **Summary**: All OpenAI calls use `response_format: { type: 'json_schema' }` to guarantee schema-conformant responses at the API level, eliminating defensive JSON parsing. This is the standard pattern for all future OpenAI integrations in the project.
- **Read when**: Adding any new OpenAI API call to the system; reviewing or updating the question generation prompt; selecting an OpenAI model; debugging generation failures

### ADR-002: Dual Question Types for Answer Security
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 001-question-bank-service (question-bank-service)
- **Path**: `bolts/001-question-bank-service/adr-002-dual-question-types-for-answer-security.md`
- **Summary**: Interview questions must never expose `answer`/`explanation` during session delivery. We define two TypeScript types — `QuestionSummary` (safe, no answer) and `Question` (full, with answer) — enforcing the boundary at compile time.
- **Read when**: Working on question delivery, session creation, or any code that fetches or returns questions to the client; implementing the answer reveal flow; adding new fields to the questions table

### ADR-001: Junction Table for Multi-Topic Questions
- **Status**: accepted
- **Date**: 2026-03-06
- **Bolt**: 001-question-bank-service (question-bank-service)
- **Path**: `bolts/001-question-bank-service/adr-001-junction-table-for-multi-topic.md`
- **Summary**: Questions can belong to multiple DevOps topics. A `question_topics` junction table (not a JSON column) is used so topics can be indexed and filtered efficiently with ANY-match semantics. Use `SELECT DISTINCT` when joining to avoid duplicate rows.
- **Read when**: Working on question schema or migrations; implementing question filtering or lookup queries; adding new multi-value associations to questions; designing similar multi-enum filtering patterns elsewhere in the codebase
