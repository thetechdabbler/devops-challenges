---
stage: technical-design
bolt: 003-question-bank-service
created: 2026-03-06T00:00:00Z
---

# Technical Design: Admin Management Layer (Bolt 003)

## Architecture Pattern

Modular monolith — same layered pattern as existing portal (middleware → controller → service → repository).

---

## Layer Structure

```
portal/backend/src/
  middleware/
    admin.middleware.ts           ← NEW — requireAdmin guard
  repositories/
    question.repository.ts       ← extend — findByStatus, updateReview, getStats
  services/
    admin-question.service.ts    ← NEW — bulkGenerate, reviewQuestion, listByStatus, getStats
  controllers/
    admin-question.controller.ts ← NEW — 4 HTTP handlers
  routes/
    admin.routes.ts              ← NEW — mounted at /api/v1/admin in index.ts
prisma/schema.prisma             ← extend — UserRole, role on User, reviewed_at/reviewed_by on Question
```

---

## Schema Changes

```prisma
enum UserRole { user  admin }

// User: add role
model User { role UserRole @default(user) }

// Question: add review audit
model Question {
  reviewed_at DateTime?
  reviewed_by Int?
  reviewer    User? @relation("QuestionReviewer", fields: [reviewed_by], references: [id])
}
```

JWT payload: add `role` field. `req.user` type extended with `role: string`.

---

## API Contracts

### POST /api/v1/admin/questions/generate
Guard: authenticate + requireAdmin
Request: `{ topics, difficulty, experienceLevel, count }` — count clamped to 50
Response: `{ status: "success", data: { requested, saved, errors } }`

### GET /api/v1/admin/questions
Guard: authenticate + requireAdmin
Query: `?status=pending_review&cursor=<id>&limit=20`
Response: `{ status: "success", data: { items: Question[], nextCursor, hasMore } }`
Returns full Question (with answer) — admin context only.

### PATCH /api/v1/admin/questions/:id
Guard: authenticate + requireAdmin
Request: `{ action: "approve"|"reject", text?: string }`
Response: `{ status: "success", data: Question }`
Idempotent on repeat approve/reject.

### GET /api/v1/admin/questions/stats
Guard: authenticate + requireAdmin
Response: `{ status: "success", data: { byTopic, byDifficulty, byType, byStatus, pendingReview } }`
Single GROUP BY raw query.

---

## Service Design

```typescript
adminQuestionService.bulkGenerate(config, adminId): Promise<BulkGenerationResult>
adminQuestionService.reviewQuestion(id, action, adminId, text?): Promise<Question>
adminQuestionService.listByStatus(status, cursor?, limit?): Promise<PaginatedResult<Question>>
adminQuestionService.getStats(): Promise<BankStats>
```

bulkGenerate reuses aiQuestionGenerator + questionRepository.saveGenerated('admin') from Bolt 002.

---

## Security Design

- requireAdmin reads req.user.role from JWT — throws ForbiddenError if not 'admin'
- Role added to JWT at login; missing role treated as 'user' (safe default for existing sessions)
- Admin endpoints return full Question (with answer) — admin review requires it

---

## NFR

- Stats: single $queryRaw GROUP BY — no N+1
- Pagination: cursor = last question id (UUID, created_at DESC)
- Bulk max: 50 enforced in controller

---

## File Checklist

- [ ] prisma/schema.prisma — UserRole, role on User, reviewed_at/reviewed_by on Question
- [ ] Migration: add-admin-role-and-review-fields
- [ ] src/types/express.d.ts — req.user extended with role
- [ ] src/services/auth.service.ts — role in JWT payload
- [ ] src/middleware/admin.middleware.ts — requireAdmin
- [ ] src/repositories/question.repository.ts — findByStatus, updateReview, getStats
- [ ] src/services/admin-question.service.ts
- [ ] src/controllers/admin-question.controller.ts
- [ ] src/routes/admin.routes.ts
- [ ] src/index.ts — register admin router
- [ ] Tests: admin-question.service.test.ts, admin-question.controller.test.ts
