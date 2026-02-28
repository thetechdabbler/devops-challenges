# Domain Entities — Unit 2: auth

## Entities

### User
Persisted in the `users` table (defined in Unit 1 schema). Auth unit reads and upserts this table via `UserRepository`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | Auto-increment PK |
| `github_id` | integer | Unique — used as upsert key |
| `username` | string | GitHub login handle; updated on each login |
| `avatar_url` | string | GitHub avatar URL; updated on each login |
| `created_at` | datetime | Set once on first login |

---

## Value Objects

### JwtPayload
The data signed into the JWT. Self-contained — no DB lookup needed to serve `GET /api/me`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | User PK in `users` table |
| `username` | string | GitHub handle at time of login |
| `avatarUrl` | string | GitHub avatar URL at time of login |
| `iat` | number | Issued-at (added by JWT library) |
| `exp` | number | Expiry timestamp (now + 24h) |

### AuthUser
The object attached to `req.user` by `AuthMiddleware` after successful token verification.

| Field | Type |
|-------|------|
| `id` | number |
| `username` | string |
| `avatarUrl` | string |

> `AuthUser` mirrors `JwtPayload` minus the JWT-specific fields (`iat`, `exp`).

### GitHubProfile
The normalized GitHub profile object received from Passport after OAuth exchange.

| Field | Type | Source |
|-------|------|--------|
| `id` | string | GitHub numeric user ID (as string) |
| `username` | string | GitHub login |
| `photos[0].value` | string | Avatar URL |

---

## Express Type Extension

`src/types/express.d.ts` (created in Unit 1 as `user?: { id: number }`) must be updated to the full `AuthUser` shape so all downstream units can safely access `req.user.username` and `req.user.avatarUrl`.

Updated shape:
```
req.user: { id: number; username: string; avatarUrl: string } | undefined
```
