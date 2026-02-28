# Code Generation Plan — Unit 2: auth

## Unit Context

- **Unit**: auth
- **Type**: Backend
- **Builds on**: Unit 1 (Prisma client + users table + Express app + AppError hierarchy)
- **Stories**: FR-07 (GitHub OAuth), NFR-02 (JWT security, CORS, AuthMiddleware)
- **Workspace root**: /Users/codespeech/practice/DevOpsTeacher

## Dependencies Confirmed
- `passport`, `passport-github2`, `jsonwebtoken`, `cookie-parser` — installed in Unit 1
- `prisma.user` model — defined in Unit 1 schema
- `AppError` hierarchy — defined in `src/lib/errors.ts`
- `ErrorMiddleware` — registered in `src/index.ts`

## Files Modified (Unit 1 → Unit 2)
| File | Change |
|------|--------|
| `src/types/express.d.ts` | Update `req.user` to full `AuthUser` shape |
| `src/lib/errors.ts` | Add `TokenExpiredError` subclass |
| `src/lib/env.ts` | Add `GITHUB_CALLBACK_URL` to required vars |
| `src/index.ts` | Register `passport.initialize()`, auth routes, `authenticate` middleware |
| `.env.example` | Add `GITHUB_CALLBACK_URL` entry |

## Files Created (Unit 2 new)
| File | Purpose |
|------|---------|
| `src/repositories/user.repository.ts` | Prisma upsert + findByGithubId |
| `src/services/auth.service.ts` | generateJWT, verifyJWT, upsertUser |
| `src/middleware/auth.middleware.ts` | JWT cookie extraction + verification |
| `src/controllers/auth.controller.ts` | OAuth initiation, callback, logout, getMe |
| `src/routes/auth.routes.ts` | Route wiring |
| `src/__tests__/user.repository.test.ts` | Unit tests |
| `src/__tests__/auth.service.test.ts` | Unit tests |
| `src/__tests__/auth.middleware.test.ts` | Unit tests |
| `src/__tests__/auth.controller.test.ts` | Unit tests |
| `aidlc-docs/construction/auth/code/code-summary.md` | Documentation |

---

## Steps

- [x] Step 1: Update `src/types/express.d.ts` — extend Request.user to AuthUser
- [x] Step 2: Update `src/lib/errors.ts` — add TokenExpiredError subclass
- [x] Step 3: Update `src/lib/env.ts` — add GITHUB_CALLBACK_URL to required vars
- [x] Step 4: Create `src/repositories/user.repository.ts`
- [x] Step 5: Create `src/services/auth.service.ts`
- [x] Step 6: Create `src/middleware/auth.middleware.ts`
- [x] Step 7: Create `src/controllers/auth.controller.ts`
- [x] Step 8: Create `src/routes/auth.routes.ts`
- [x] Step 9: Update `src/index.ts` — register Passport, auth routes, authenticate middleware
- [x] Step 10: Update `portal/.env.example` — add GITHUB_CALLBACK_URL
- [x] Step 11: Create 4 test files (user.repository, auth.service, auth.middleware, auth.controller)
- [x] Step 12: Create `aidlc-docs/construction/auth/code/code-summary.md`
