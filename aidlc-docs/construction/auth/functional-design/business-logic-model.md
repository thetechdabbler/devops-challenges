# Business Logic Model — Unit 2: auth

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `UserRepository` | DB access — find user by GitHub ID, upsert user record |
| `AuthService` | Orchestration — upsert user, issue JWT, verify JWT |
| `AuthMiddleware` | Request-level — extract + verify JWT cookie, attach `req.user` |
| `AuthController` | HTTP layer — OAuth initiation, callback handling, logout, getMe |
| `auth.routes.ts` | Route wiring — maps URL + HTTP method to controller functions |

---

## OAuth Login Flow

```
Browser                    Backend                         GitHub
  │                           │                               │
  │── GET /auth/github ───────▶│                               │
  │                           │── redirect to GitHub OAuth ──▶│
  │                           │                               │
  │◀─ redirect to GitHub ─────│                               │
  │──────────────────── user authorises ────────────────────▶│
  │                           │                               │
  │◀─ redirect to /auth/github/callback?code=... ────────────│
  │── GET /auth/github/callback ─────────────────────────────▶│
  │                           │── Passport exchanges code ──▶│
  │                           │◀─ GitHub profile ────────────│
  │                           │
  │                           ├─ AuthService.upsertUser(profile)
  │                           │   └─ UserRepository.upsert(githubId, username, avatarUrl)
  │                           │       └─ Prisma upsert → returns User
  │                           │
  │                           ├─ AuthService.generateJWT(user)
  │                           │   └─ jwt.sign({ id, username, avatarUrl }, JWT_SECRET, { expiresIn: '24h' })
  │                           │
  │                           ├─ Set-Cookie: auth_token=<jwt>; HttpOnly; SameSite=Strict; MaxAge=86400
  │                           │
  │◀── 302 redirect to FRONTEND_URL/auth/callback ───────────│
```

### OAuth Failure Path
If Passport strategy reports failure (user denies, GitHub error):
```
Backend → 302 redirect to FRONTEND_URL/?error=auth_failed
```

---

## GetMe Flow

```
Browser                    Backend
  │                           │
  │── GET /api/me ────────────▶│
  │   (Cookie: auth_token=...) │
  │                           ├─ AuthMiddleware
  │                           │   ├─ Read req.cookies['auth_token']
  │                           │   ├─ jwt.verify(token, JWT_SECRET)  → { id, username, avatarUrl, iat, exp }
  │                           │   └─ req.user = { id, username, avatarUrl }; next()
  │                           │
  │                           ├─ AuthController.getMe
  │                           │   └─ return res.json(req.user)        ← no DB hit
  │                           │
  │◀── 200 { id, username, avatarUrl } ──────────────────────│
```

---

## Logout Flow

```
Browser                    Backend
  │                           │
  │── POST /api/auth/logout ──▶│
  │                           ├─ Clear cookie: Set-Cookie: auth_token=; MaxAge=0
  │                           └─ return 200 { message: 'Logged out' }
  │◀── 200 ──────────────────│
```

> `AuthMiddleware` is NOT applied to this route — logout succeeds regardless of token state.

---

## AuthMiddleware Pseudocode

```
function authenticate(req, res, next):
  token = req.cookies['auth_token']
  if not token:
    throw UnauthorizedError('Authentication required')

  try:
    payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.id, username: payload.username, avatarUrl: payload.avatarUrl }
    next()
  catch JwtExpiredError, JwtInvalidError:
    throw UnauthorizedError('Invalid or expired token')
```

---

## UserRepository Pseudocode

```
function upsert(data: { githubId, username, avatarUrl }):
  return prisma.user.upsert({
    where:  { github_id: data.githubId },
    create: { github_id: data.githubId, username: data.username, avatar_url: data.avatarUrl },
    update: { username: data.username, avatar_url: data.avatarUrl }
  })

function findByGithubId(githubId):
  return prisma.user.findUnique({ where: { github_id: githubId } })
```

---

## Route Registration Strategy

To satisfy BR-08 (logout exempt from AuthMiddleware, all other `/api/*` routes protected):

```
app.use('/auth', oauthRouter)              // GET /auth/github, GET /auth/github/callback
app.post('/api/auth/logout', logoutHandler) // registered BEFORE global auth middleware
app.use('/api', authenticate, apiRouter)   // all other /api/* routes are protected
```

> `authenticate` is applied as router-level middleware on `/api` after the logout route is registered directly on the app. This avoids opt-out patterns and keeps route protection explicit.

---

## Passport.js Strategy Configuration

```
GitHubStrategy(
  clientID:     GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL:  'http(s)://<backend-host>/auth/github/callback'
)

verify callback(accessToken, refreshToken, profile, done):
  done(null, profile)   // pass raw profile; transformation done in AuthService
```

The strategy passes the raw GitHub profile to `done()`. `AuthController.handleOAuthCallback` receives it as `req.user` (Passport convention during the callback phase only), then calls `AuthService.upsertUser()` to get the persisted `User` entity before issuing the JWT.

> Note: After the OAuth callback, `req.user` is re-assigned to `AuthUser` (the JWT payload shape) by `AuthMiddleware` on all subsequent requests. The Passport `req.user` in the callback handler is a transient value used only during the OAuth exchange.
