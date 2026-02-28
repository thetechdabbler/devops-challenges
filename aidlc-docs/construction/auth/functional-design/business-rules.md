# Business Rules — Unit 2: auth

## BR-01 — Cookie Security Properties

The JWT must be stored in a cookie with these attributes:
- `httpOnly: true` — inaccessible to JavaScript (prevents XSS token theft)
- `sameSite: 'strict'` — not sent on cross-origin requests (CSRF mitigation)
- `secure: true` in production (`NODE_ENV === 'production'`); `false` in development to allow HTTP localhost
- `maxAge`: 24 hours in milliseconds (86400000)
- Cookie name: `auth_token`

## BR-02 — JWT Payload and Expiry

JWT payload must contain `{ id, username, avatarUrl }`. Token expiry is **24 hours** from issue time (`expiresIn: '24h'`). Signed with `JWT_SECRET` env var using HS256.

Because the payload is self-contained, `GET /api/me` does not require a DB query — it decodes and returns the payload directly.

## BR-03 — User Upsert on Login

On every successful GitHub OAuth callback, the user record must be upserted by `github_id`:
- **If new user**: create a new `users` row
- **If existing user**: update `username` and `avatar_url` to reflect any changes on GitHub

The upsert happens on every login — never skip it. This ensures stale data (e.g., renamed GitHub handle) is corrected automatically.

## BR-04 — AuthMiddleware Behaviour

`AuthMiddleware` must:
1. Read `req.cookies['auth_token']`
2. If cookie is absent or empty → throw `UnauthorizedError` (`401`, code `'UNAUTHORIZED'`)
3. Call `AuthService.verifyJWT(token)` — if verification throws (expired, invalid signature, malformed) → throw `UnauthorizedError`
4. Attach decoded payload as `req.user: AuthUser`
5. Call `next()`

`AuthMiddleware` is applied to ALL `/api/*` routes except `POST /api/auth/logout` (logout is exempt — always succeeds regardless of token state).

## BR-05 — Logout Clears Cookie

`POST /api/auth/logout` must clear the `auth_token` cookie by setting `maxAge: 0` (or `expires: past date`). Returns `200 { message: 'Logged out' }`. No server-side token tracking is required.

## BR-06 — OAuth Success Redirect

After the GitHub callback is processed and the JWT cookie is set, the backend redirects the browser to:
```
FRONTEND_URL + '/auth/callback'
```
This allows the frontend `OAuthCallback` page to hydrate the auth store (by calling `GET /api/me` with the newly set cookie) before navigating to `/dashboard`.

## BR-07 — OAuth Failure Redirect

If OAuth fails for any reason (user denies, GitHub error, state mismatch, Passport error), the backend redirects to:
```
FRONTEND_URL + '/?error=auth_failed'
```
This gives the `AuthPage` the opportunity to display an error message.

## BR-08 — Route Protection Scope

| Route | Auth Required |
|-------|:---:|
| `GET /auth/github` | No |
| `GET /auth/github/callback` | No |
| `POST /api/auth/logout` | No |
| `GET /api/me` | Yes |
| All `/api/*` routes from Units 3–5 | Yes |

Implemented by applying `AuthMiddleware` as a router-level middleware on the main `/api` prefix in `index.ts`, with the logout route registered before the middleware is applied (or on a separate sub-router).
