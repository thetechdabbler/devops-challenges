# Deployment Architecture — Unit 2: auth

## Traffic Flow (Auth Routes)

```
Internet
  │
  ▼
Caddy :443 (TLS termination)
  │
  ├── /auth/*   ──────────────────▶ backend:3001
  │                                     │
  │                               passport.authenticate('github')
  │                                     │
  │                               302 → github.com/login/oauth
  │                                     │
  │◀─── GitHub redirect ────────────────┘
  │     /auth/github/callback?code=...
  │
  ├── /auth/github/callback ──────▶ backend:3001
  │                                     │
  │                               Passport exchanges code
  │                               UserRepository.upsert()
  │                               jwt.sign() → Set-Cookie: auth_token
  │                                     │
  │◀─── 302 → FRONTEND_URL/auth/callback ┘
  │
  └── /api/* ──────────────────────▶ backend:3001
                                        │
                                   AuthMiddleware
                                   jwt.verify(auth_token cookie)
                                        │
                                   route handler
```

---

## GitHub OAuth App Settings Per Environment

### Local Development
| Setting | Value |
|---------|-------|
| Homepage URL | `http://localhost:5173` |
| Authorization callback URL | `http://localhost:3001/auth/github/callback` |
| `GITHUB_CALLBACK_URL` env | `http://localhost:3001/auth/github/callback` |

> The callback goes to port 3001 (backend) directly — Vite proxy is frontend-only and does not handle GitHub's redirect.

### Production (VPS)
| Setting | Value |
|---------|-------|
| Homepage URL | `https://your-domain.com` |
| Authorization callback URL | `https://your-domain.com/auth/github/callback` |
| `GITHUB_CALLBACK_URL` env | `https://your-domain.com/auth/github/callback` |

> Caddy receives the redirect on :443 and proxies `/auth/*` to `backend:3001` — the client-visible URL is the domain, not the internal port.

---

## Cookie Flow (Browser Perspective)

```
1. Browser navigates to GET /auth/github
   └─ Caddy → backend → Passport → 302 to github.com

2. GitHub redirects browser to GET /auth/github/callback
   └─ Caddy → backend → Passport callback
      └─ backend sets: Set-Cookie: auth_token=<JWT>; Path=/; HttpOnly; SameSite=Strict; MaxAge=86400

3. Browser stores cookie. Redirected to FRONTEND_URL/auth/callback
   └─ Frontend calls GET /api/me
      └─ Browser automatically sends Cookie: auth_token=<JWT>
      └─ AuthMiddleware verifies → 200 { id, username, avatarUrl }

4. All subsequent /api/* requests carry the cookie automatically
   └─ No JavaScript token management required
```

---

## No New Docker Compose Changes

`docker-compose.yml` from Unit 1 requires no modifications. The new `GITHUB_CALLBACK_URL` env var is passed to the backend service through the existing `env_file: .env` directive.

---

## GitHub OAuth App — Two Apps Required

Maintain two separate GitHub OAuth Apps to avoid callback URL conflicts:

| App | Callback URL | Used For |
|-----|-------------|----------|
| `devops-portal-dev` | `http://localhost:3001/auth/github/callback` | Local development |
| `devops-portal-prod` | `https://your-domain.com/auth/github/callback` | Production VPS |

Each app produces its own `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` pair, stored in the corresponding `.env` file.
