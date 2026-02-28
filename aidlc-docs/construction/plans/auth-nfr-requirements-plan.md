# NFR Requirements Plan — Unit 2: auth

## Scope

Most NFR decisions are inherited from Unit 1 (pino logging, no rate limiting, 2–5 users, Docker Compose deployment). This plan focuses on the NFRs specific to authentication.

---

## Plan Checklist

- [x] Analyze functional design artifacts
- [x] Collect answers to auth-specific NFR questions
- [x] Generate nfr-requirements.md
- [x] Generate tech-stack-decisions.md
- [ ] Present for approval

---

## Questions

**Q1 — GitHub OAuth scope**
What GitHub OAuth scopes should be requested? The portal only needs `github_id`, `username`, and `avatar_url` — all of which are available on the public profile without any scope.

A) No explicit scope (`scope: []`) — public profile only; minimal permission footprint
B) `['read:user']` — grants access to private profile data (email, etc.) even though we don't use it

[Answer]:

**Q2 — OAuth callback URL — configuration**
The Passport GitHub strategy requires a `callbackURL` that must match the OAuth App setting in GitHub exactly.

A) Add `GITHUB_CALLBACK_URL` env var — explicit and flexible per environment; added to `.env.example`
B) Construct from `PORT` — hardcode `http://localhost:{PORT}/auth/github/callback` in dev, `https://{domain}/auth/github/callback` in prod — but this requires knowing the production domain in code

[Answer]:

**Q3 — Expired token error code**
When `AuthMiddleware` detects an expired JWT (as distinct from a missing or invalid one), should it return a specific error code that the frontend can use to show "Session expired" instead of a generic "Unauthorized"?

A) Single code — always return `{ error: { code: 'UNAUTHORIZED', message: '...' } }` regardless of reason
B) Distinct code — return `{ error: { code: 'TOKEN_EXPIRED', message: 'Session expired' } }` for expired tokens; `UNAUTHORIZED` for missing/invalid

[Answer]:
