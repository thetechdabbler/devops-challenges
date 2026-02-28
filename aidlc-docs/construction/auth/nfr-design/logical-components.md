# Logical Components — Unit 2: auth

## Component Map

```
HTTP Layer
  └── AuthController
        ├── initiateGitHubOAuth   → delegates to Passport
        ├── handleOAuthCallback   → AuthService.upsertUser() + AuthService.generateJWT() + set cookie + redirect
        ├── logout                → clear cookie + 200
        └── getMe                 → return req.user (no service call)

Middleware Layer
  └── AuthMiddleware
        └── reads auth_token cookie → AuthService.verifyJWT() → sets req.user → next()

Service Layer
  └── AuthService
        ├── upsertUser(profile)   → UserRepository.upsert()
        ├── generateJWT(user)     → jwt.sign()
        └── verifyJWT(token)      → jwt.verify()

Repository Layer
  └── UserRepository
        ├── upsert(data)          → prisma.user.upsert()
        └── findByGithubId(id)    → prisma.user.findUnique()

Infrastructure
  └── PassportGitHubStrategy      → passport.use(new GitHubStrategy(...))

Error Types (added in Unit 2)
  └── TokenExpiredError           → extends AppError (statusCode: 401, code: 'TOKEN_EXPIRED')
```

---

## Component Interfaces

### AuthService
```typescript
interface IAuthService {
  upsertUser(profile: GitHubProfile): Promise<User>
  generateJWT(user: User): string
  verifyJWT(token: string): JwtPayload
}
```

### UserRepository
```typescript
interface IUserRepository {
  upsert(data: { githubId: number; username: string; avatarUrl: string }): Promise<User>
  findByGithubId(githubId: number): Promise<User | null>
}
```

### AuthMiddleware
```typescript
type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => void
// Attaches req.user: { id: number; username: string; avatarUrl: string }
// Throws TokenExpiredError | UnauthorizedError on failure
```

---

## Data Flow Diagram

```
GitHub OAuth Flow:
  Browser → GET /auth/github
          → PassportGitHubStrategy → GitHub
          → GET /auth/github/callback
          → PassportGitHubStrategy (verifies state, exchanges code)
          → AuthController.handleOAuthCallback
          → AuthService.upsertUser → UserRepository.upsert → Prisma → DB
          → AuthService.generateJWT → jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
          → res.cookie('auth_token', jwt, cookieOptions)
          → redirect → FRONTEND_URL/auth/callback

Authenticated Request Flow:
  Browser → GET /api/* (Cookie: auth_token=JWT)
          → AuthMiddleware → AuthService.verifyJWT → jwt.verify
          → req.user = { id, username, avatarUrl }
          → route handler (no further auth DB access)
```

---

## Route Registration Order (index.ts additions)

```typescript
// 1. OAuth routes — public, no AuthMiddleware
app.use('/auth', authOAuthRouter)

// 2. Logout — public (exempt from AuthMiddleware)
app.post('/api/auth/logout', logoutHandler)

// 3. Protected API routes — AuthMiddleware applied here
app.use('/api', authenticate, apiRouter)
//                ^^^^^^^^^
//   authenticate = AuthMiddleware
//   apiRouter will include /me and all future unit routes
```

---

## Files to Create (Unit 2)

| File | Component |
|------|-----------|
| `src/repositories/user.repository.ts` | `UserRepository` |
| `src/services/auth.service.ts` | `AuthService` |
| `src/middleware/auth.middleware.ts` | `AuthMiddleware` |
| `src/controllers/auth.controller.ts` | `AuthController` |
| `src/routes/auth.routes.ts` | Route wiring |

### Files to Update (from Unit 1)
| File | Change |
|------|--------|
| `src/types/express.d.ts` | Update `req.user` type to `AuthUser` |
| `src/lib/errors.ts` | Add `TokenExpiredError` subclass |
| `src/index.ts` | Register auth routes and `authenticate` middleware |
| `.env.example` | Add `GITHUB_CALLBACK_URL` |
