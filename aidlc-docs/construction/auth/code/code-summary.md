# Code Summary — Unit 2: auth

## Files Modified (Unit 1 → Unit 2)

| File | Change |
|------|--------|
| `src/types/express.d.ts` | `req.user` updated to `{ id, username, avatarUrl }` |
| `src/lib/errors.ts` | Added `TokenExpiredError` (code: `TOKEN_EXPIRED`, status: 401) |
| `src/lib/env.ts` | Added `GITHUB_CALLBACK_URL` to required vars (total: 8) |
| `src/index.ts` | Registered `GitHubStrategy`, `passport.initialize()`, `oauthRouter`, logout route, `GET /api/me` |
| `portal/.env.example` | Added `GITHUB_CALLBACK_URL` with dev/prod examples |

## Files Created (Unit 2 new)

### portal/backend/src/

| File | Purpose |
|------|---------|
| `repositories/user.repository.ts` | `findByGithubId`, `upsert` via Prisma |
| `services/auth.service.ts` | `upsertUser`, `generateJWT` (24h HS256), `verifyJWT` (TokenExpiredError vs UnauthorizedError) |
| `middleware/auth.middleware.ts` | Reads `auth_token` cookie, verifies JWT, attaches `req.user` |
| `controllers/auth.controller.ts` | `handleOAuthCallback`, `logout`, `getMe` |
| `routes/auth.routes.ts` | `GET /auth/github`, `GET /auth/github/callback` |
| `__tests__/user.repository.test.ts` | 3 tests — findByGithubId (found/null), upsert args |
| `__tests__/auth.service.test.ts` | 5 tests — upsertUser, generateJWT payload, verifyJWT (valid/expired/invalid) |
| `__tests__/auth.middleware.test.ts` | 4 tests — missing cookie, valid token, expired, invalid |
| `__tests__/auth.controller.test.ts` | 4 tests — logout cookie, getMe, callback success, callback error |

## Also Updated

| File | Change |
|------|--------|
| `src/__tests__/env.test.ts` | Added `GITHUB_CALLBACK_URL` to REQUIRED array (now 8 vars, 9 tests) |

## Story Coverage

| Requirement | Covered By |
|-------------|-----------|
| FR-07 — GitHub OAuth | `auth.routes.ts` → `passport.authenticate` → `handleOAuthCallback` |
| FR-07 — User upsert | `auth.service.upsertUser` → `user.repository.upsert` |
| FR-07 — JWT cookie | `handleOAuthCallback` sets `auth_token` httpOnly cookie (24h) |
| NFR-02 — httpOnly cookie | `cookieOptions` in `auth.controller.ts` |
| NFR-02 — CORS | Inherited from Unit 1 `index.ts` |
| NFR-02 — AuthMiddleware | `authenticate` in `auth.middleware.ts` — guards `GET /api/me` and all future `/api/*` |
| NFR-02 — 401 on invalid token | `UnauthorizedError` / `TokenExpiredError` thrown by `authenticate` |
