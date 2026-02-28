# NFR Requirements — Unit 2: auth

## Inherited from Unit 1 (unchanged)

| NFR | Value |
|-----|-------|
| Concurrent users | 2–5 |
| Rate limiting | None |
| Logging | pino structured JSON |
| Deployment | Docker Compose |

---

## Security Requirements

### SR-01 — Token Storage
JWT must be stored in a cookie with attributes: `httpOnly=true`, `sameSite=strict`, `secure=true` (production only), `maxAge=86400000` (24h). The token must never be returned in a response body or accessible from JavaScript.

### SR-02 — OAuth Scope
GitHub OAuth must request **no explicit scope** (`scope: []`). The public profile (username, avatar) is available without any permission grants. Requesting unnecessary scopes (`read:user`, `user:email`) violates the principle of least privilege for a private app.

### SR-03 — CORS
CORS remains restricted to `FRONTEND_URL` (set in Unit 1). Auth routes are not exempt — all cross-origin requests must originate from the configured frontend origin.

### SR-04 — Callback URL as Env Var
`GITHUB_CALLBACK_URL` must be an environment variable. Hardcoding it would prevent the same codebase from working across local dev (`http://localhost:3001/auth/github/callback`) and production (`https://your-domain.com/auth/github/callback`). Added to `.env.example`.

### SR-05 — No Token Tracking
Tokens are stateless — no server-side session store or token blacklist is maintained. For a 2–5 user private app, this is an acceptable trade-off. Logout is implemented by clearing the cookie client-side only.

---

## Performance Requirements

### PR-01 — Auth Middleware Overhead
`jwt.verify()` is a synchronous CPU operation taking ~1ms. At 2–5 concurrent users this is negligible. No caching of verification results is needed.

### PR-02 — Zero DB Hits on Authenticated Requests
Because the JWT payload includes `{ id, username, avatarUrl }`, `GET /api/me` and `AuthMiddleware` require no database queries. DB access is limited to login (one upsert per OAuth callback).

---

## Reliability Requirements

### RR-01 — Distinct Error Codes
`AuthMiddleware` must distinguish between two failure modes:

| Condition | HTTP | `code` | `message` |
|-----------|------|--------|-----------|
| Cookie absent or empty | 401 | `UNAUTHORIZED` | `'Authentication required'` |
| Token present but invalid signature or malformed | 401 | `UNAUTHORIZED` | `'Invalid token'` |
| Token present but expired (`jwt.TokenExpiredError`) | 401 | `TOKEN_EXPIRED` | `'Session expired, please sign in again'` |

Frontend uses `TOKEN_EXPIRED` to show a targeted "session expired" message rather than a generic "unauthorized" error.

### RR-02 — OAuth Failure Handling
Any Passport strategy error (GitHub unreachable, user denies, state mismatch) must result in a redirect to `FRONTEND_URL/?error=auth_failed` rather than a 500 error page. This ensures the user always lands on a recognisable page.

### RR-03 — Upsert Idempotency
`UserRepository.upsert()` must be safe to call multiple times with the same `github_id`. Prisma's `upsert` with `where: { github_id }` is idempotent by design.
