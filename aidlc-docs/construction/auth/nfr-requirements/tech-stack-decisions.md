# Tech Stack Decisions — Unit 2: auth

## No New Packages Required

All dependencies for Unit 2 were already installed in Unit 1's `package.json`:

| Package | Version | Role |
|---------|---------|------|
| `passport` | ^0.7.0 | OAuth middleware framework |
| `passport-github2` | ^0.1.12 | GitHub OAuth 2.0 strategy for Passport |
| `jsonwebtoken` | ^9.0.2 | JWT sign and verify |
| `cookie-parser` | ^1.4.6 | Parses `Cookie` header into `req.cookies` |
| `@types/passport` | ^1.0.16 | TypeScript types |
| `@types/passport-github2` | ^1.2.9 | TypeScript types |
| `@types/jsonwebtoken` | ^9.0.6 | TypeScript types |

---

## Decision Log

### D-01 — Passport.js for OAuth (not manual OAuth)
**Chosen**: `passport` + `passport-github2`
**Rationale**: Passport handles the OAuth state parameter, CSRF nonce, code-for-token exchange, and profile normalisation. Implementing this manually is error-prone. `passport-github2` is maintained and covers the full GitHub OAuth 2.0 flow.
**Alternative rejected**: Manual `fetch` to GitHub token endpoint — more code, more surface area for bugs.

### D-02 — `jsonwebtoken` (HS256, not RS256)
**Chosen**: HS256 (symmetric HMAC-SHA256) via `jsonwebtoken`
**Rationale**: Single server — no need for public key distribution. HS256 with a 64-char `JWT_SECRET` is cryptographically sufficient. RS256 adds key management overhead that isn't justified for 2–5 users.

### D-03 — No Refresh Token
**Chosen**: Single 24h access token; expired token requires re-login
**Rationale**: Refresh tokens require a server-side store (Redis or DB table) to support rotation and revocation. For a private 2–5 user app, the UX cost of re-logging in once a day is acceptable and far simpler to implement and reason about.

### D-04 — `GITHUB_CALLBACK_URL` as Env Var
**Chosen**: Explicit env var in `.env.example`
**Rationale**: The callback URL must exactly match the GitHub OAuth App registration. Different environments (local dev, production) have different URLs. An env var makes this explicit and avoids conditional logic in code.

### D-05 — No Additional CSRF Middleware
**Chosen**: Rely on `sameSite: 'strict'` cookie attribute
**Rationale**: `SameSite=Strict` prevents the cookie from being sent on cross-origin requests, which eliminates CSRF risk for cookie-based auth. Adding `csurf` or a custom CSRF token would add complexity without meaningful security benefit for a same-origin SPA.
