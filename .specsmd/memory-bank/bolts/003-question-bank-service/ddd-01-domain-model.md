---
stage: domain-model
bolt: 003-question-bank-service
created: 2026-03-06T00:00:00Z
---

# Static Model: Admin Management Layer (Bolt 003)

## Context

Extends the Question Bank domain from Bolts 001/002 with admin management: bulk generation,
review workflow, and statistics. Also introduces the admin role concept to the User entity.

## Entities

- **User** (extended): New `role: 'admin' | 'user'` field — added to DB model and JWT payload. Admin role gates all /api/v1/admin/ endpoints.
- **Question** (extended): New `reviewed_at?: Date`, `reviewed_by?: number` (FK to User) — set atomically on approve/reject. Invariant: both fields always set together.

## Value Objects

- **ReviewAction**: `'approve' | 'reject'`
- **ReviewRequest**: `{ action: ReviewAction, text?: string }` — text only relevant on approve
- **BulkGenerationResult**: `{ requested: number, saved: number, errors: number }`
- **BankStats**: `{ byTopic: Record<Topic, number>, byDifficulty: Record<number, number>, byType: Record<QuestionType, number>, byStatus: Record<QuestionStatus, number>, pendingReview: number }`

## Aggregates

- **QuestionBank** (aggregate root — extended): New invariant: reviewed_at and reviewed_by set atomically — no partial review state.

## Domain Events

- **QuestionApproved**: Trigger: admin approves — Payload: `{ questionId, adminId, updatedText? }`
- **QuestionRejected**: Trigger: admin rejects — Payload: `{ questionId, adminId }`
- **BulkGenerationTriggered**: Trigger: POST /generate — Payload: `{ config, requested, saved }`

## Domain Services

- **AdminQuestionService**: `bulkGenerate(config, adminId)`, `reviewQuestion(id, action, adminId, text?)`, `getStats()`
- **AdminGuard**: Middleware — checks `req.user.role === 'admin'`, throws ForbiddenError otherwise

## Repository Interfaces

- **IQuestionRepository** (extended):
  - `findByStatus(status, cursor?, limit?)` → paginated Question list
  - `updateReview(id, status, adminId, text?)` → atomic Question update
  - `getStats()` → BankStats aggregation

## Ubiquitous Language

- **Review queue**: Questions with status=pending_review awaiting admin action
- **Approve**: Set status=active, optionally update text, record reviewer+timestamp
- **Reject**: Set status=rejected, record reviewer+timestamp (soft delete — stays in DB)
- **Bulk generation**: Admin-triggered OpenAI generation saved as pending_review
- **Bank stats**: Aggregate counts grouped by topic/difficulty/type/status
- **Admin guard**: Middleware enforcing role=admin on all /api/v1/admin/ routes
