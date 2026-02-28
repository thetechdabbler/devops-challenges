# NFR Design Patterns — Unit 2: auth

## Pattern 1 — Stateless Authentication (JWT in HttpOnly Cookie)

**Addresses**: SR-01, SR-05, D-03

The server issues a signed JWT and stores it in a cookie. No session state is kept server-side. Every request is self-validating: the `AuthMiddleware` verifies the signature and expiry without touching the database.

```
Client                      Server
  │── POST /api/* ──────────▶│
  │   Cookie: auth_token=JWT │
  │                          ├─ jwt.verify(token, JWT_SECRET)
  │                          │   → { id, username, avatarUrl, exp }
  │                          ├─ req.user = payload
  │                          └─ next()
```

**Properties**:
- Horizontally scalable (no shared session store)
- Cookie attributes: `httpOnly`, `sameSite: 'strict'`, `secure` in production
- Expiry enforced by `exp` claim — no server revocation list needed

---

## Pattern 2 — Token Error Classification

**Addresses**: RR-01

`jwt.verify()` throws typed errors that must be caught and mapped to distinct API error codes:

```typescript
try {
  payload = jwt.verify(token, JWT_SECRET)
} catch (err) {
  if (err instanceof jwt.TokenExpiredError) {
    throw new TokenExpiredError()        // → { code: 'TOKEN_EXPIRED', status: 401 }
  }
  throw new UnauthorizedError()          // → { code: 'UNAUTHORIZED', status: 401 }
}
```

**AppError subclass added in Unit 2**:
```
TokenExpiredError extends AppError
  statusCode: 401
  code: 'TOKEN_EXPIRED'
  message: 'Session expired, please sign in again'
```

The existing `ErrorMiddleware` (Unit 1) maps this to the standard error envelope automatically — no changes to `error.middleware.ts` required.

---

## Pattern 3 — OAuth Resilience (Graceful Failure Redirect)

**Addresses**: RR-02

Any error in the OAuth flow (Passport strategy failure, GitHub unreachable, user denies) must result in a browser redirect rather than a 500 error page. This is implemented via Passport's `failureRedirect` option and an explicit catch in the callback handler.

```typescript
// OAuth callback route
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/?error=auth_failed`, session: false }),
  handleOAuthCallback
)

// handleOAuthCallback is wrapped in try/catch → on error, redirect to FRONTEND_URL/?error=auth_failed
```

**Guarantees**: User always lands on a known page, never a raw Express error.

---

## Pattern 4 — Zero-DB Auth Middleware

**Addresses**: PR-01, PR-02

The JWT payload carries `{ id, username, avatarUrl }` — the three fields all downstream units need from `req.user`. `AuthMiddleware` never queries the database; it only calls `jwt.verify()`.

```
Request arrives → jwt.verify() → req.user set → handler runs
                        ↑
                 No DB query here
```

DB access is confined to login only (one `UserRepository.upsert()` per OAuth callback). All other authenticated requests are zero-DB in the auth layer.

---

## Pattern 5 — Upsert Idempotency

**Addresses**: RR-03

`UserRepository.upsert()` uses Prisma's atomic `upsert` operation keyed on `github_id`. This is safe to call multiple times:

```typescript
prisma.user.upsert({
  where:  { github_id: githubId },
  create: { github_id, username, avatar_url },
  update: { username, avatar_url }          // always refreshes on login
})
```

**Properties**:
- Safe on duplicate GitHub callbacks (network retry, browser back button)
- Automatically syncs GitHub handle and avatar changes on each login
- Single atomic DB operation — no check-then-insert race condition

---

## Pattern 6 — Least-Privilege OAuth Scope

**Addresses**: SR-02

Passport GitHub strategy is configured with `scope: []` (empty array). GitHub's public profile endpoint returns `login` (username) and `avatar_url` without any OAuth scope. No sensitive data (email, private repos) is ever requested or received.

```typescript
passport.use(new GitHubStrategy(
  { clientID, clientSecret, callbackURL, scope: [] },
  verifyCallback
))
```
