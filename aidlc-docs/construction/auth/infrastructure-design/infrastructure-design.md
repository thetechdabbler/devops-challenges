# Infrastructure Design — Unit 2: auth

## Summary

Unit 2 introduces no new Docker services, volumes, networks, or Caddy routing rules. All auth components run inside the existing `backend` service defined in Unit 1. The only infrastructure change is one new environment variable.

---

## Existing Infrastructure (Unit 1) — Unchanged

| Service | Image | Role |
|---------|-------|------|
| `postgres` | `postgres:16-alpine` | User data persistence (users table) |
| `backend` | Custom (Node 20 + Express) | Hosts all auth components |
| `frontend` | Custom (nginx) | SPA — no auth logic |
| `caddy` | `caddy:2-alpine` | Reverse proxy — no changes needed |

---

## Component-to-Service Mapping

| Logical Component | Runs In | Notes |
|------------------|---------|-------|
| `PassportGitHubStrategy` | `backend` | Registered once at startup |
| `AuthController` | `backend` | Express route handlers |
| `AuthService` | `backend` | Pure in-process logic |
| `UserRepository` | `backend` | Prisma client → postgres |
| `AuthMiddleware` | `backend` | Express middleware |
| JWT signing/verification | `backend` | In-memory CPU operation |

---

## Caddy Routing — No Changes

The `/auth/*` prefix was already routed to the backend in the Unit 1 Caddyfile:

```
handle /auth/* {
  reverse_proxy backend:3001
}
```

`GET /auth/github` and `GET /auth/github/callback` are covered by this existing rule. No Caddyfile changes needed.

---

## Environment Variable Changes

One new variable is added to `.env.example`:

| Variable | Required | Description | Example (dev) | Example (prod) |
|----------|----------|-------------|---------------|----------------|
| `GITHUB_CALLBACK_URL` | Yes | Full URL of the OAuth callback endpoint — must match GitHub OAuth App settings exactly | `http://localhost:3001/auth/github/callback` | `https://your-domain.com/auth/github/callback` |

> **Note**: In local development, the callback URL points directly to the backend (`localhost:3001`) because the GitHub OAuth redirect goes straight to the backend — Vite's dev proxy is not involved in GitHub's redirect. In production, Caddy receives the redirect on port 443 and proxies it to `backend:3001`.

---

## validateEnv Update

`src/lib/env.ts` must add `GITHUB_CALLBACK_URL` to the list of required variables (raising the total from 7 to 8).

---

## Passport Session Configuration

Passport session support is disabled (`session: false`) — JWT in cookies is the session mechanism. This means `passport.initialize()` is required but `passport.session()` must NOT be registered. No session middleware (e.g., `express-session`) is added.
