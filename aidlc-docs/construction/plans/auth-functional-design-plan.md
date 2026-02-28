# Functional Design Plan — Unit 2: auth

## Scope

This unit implements the complete GitHub OAuth authentication flow for the portal. It builds on:
- Unit 1: Prisma `users` table, Express app skeleton, `AppError` hierarchy, `validateEnv`, pino logger

It produces:
- `UserRepository` — DB access for user lookup and upsert
- `AuthService` — JWT generation/verification; user upsert orchestration
- `AuthMiddleware` — JWT extraction from httpOnly cookie; `req.user` attachment
- `AuthController` — OAuth initiation, callback, logout, `getMe`
- `auth.routes.ts` — route wiring

---

## Plan Checklist

- [x] Analyze unit context (unit-of-work.md, story-map)
- [x] Collect design decisions via questions below
- [x] Generate domain-entities.md
- [x] Generate business-rules.md
- [x] Generate business-logic-model.md
- [ ] Present for approval

---

## Design Questions

**Q1 — JWT expiry**: 24 hours
**Q2 — JWT payload**: B — `{ id, username, avatarUrl }` (self-contained, no DB hit on getMe)
**Q3 — OAuth success redirect**: B — `FRONTEND_URL + '/auth/callback'`
**Q4 — OAuth failure redirect**: B — `FRONTEND_URL + '/?error=auth_failed'`
**Q5 — Cookie name**: B — `auth_token`
