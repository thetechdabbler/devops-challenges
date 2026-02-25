# Business Logic Model — Unit 1: setup

---

## Application Initialization Flow

```
Server process starts
         |
         v
1. Environment Validation (BR-04)
         |
         +-- Any var missing --> log FATAL + process.exit(1)
         |
         v
2. PrismaClient singleton created (lib/prisma.ts)
         |
         v
3. DB Connection with Retry (BR-03)
         |
         +-- Attempt 1..10: PrismaClient.$connect()
         |       |
         |       +-- Success --> proceed to step 4
         |       +-- Failure --> log attempt, wait 2s, retry
         |
         +-- All 10 fail --> log FATAL + process.exit(1)
         |
         v
4. ContentService.initialize()
         |
         +-- Scan CONTENT_PATH (devops-challenges/) filesystem
         +-- Build in-memory units index
         +-- Log: "Content index built: 8 units, 80 exercises"
         |
         v
5. Express app created (app.ts)
         |
         v
6. Global Middleware Registered (in order):
         a. express.json()          -- parse application/json bodies
         b. express.urlencoded()    -- parse form bodies (for OAuth callbacks)
         c. cookie-parser           -- make req.cookies available
         d. cors({ origin: FRONTEND_URL, credentials: true })
         |
         v
7. Routes Mounted:
         a. GET  /health            -- HealthController (no auth)
         b. GET  /auth/github       -- AuthController (Unit 2, no auth)
         c. GET  /auth/github/callback -- AuthController (Unit 2, Passport)
         d. POST /api/auth/logout   -- AuthController (Unit 2, AuthMiddleware)
         e. GET  /api/me            -- AuthController (Unit 2, AuthMiddleware)
         f. GET  /api/content/*     -- ContentController (Unit 3, AuthMiddleware)
         g. GET  /api/progress      -- ProgressController (Unit 4, AuthMiddleware)
         h. PUT  /api/progress/*    -- ProgressController (Unit 4, AuthMiddleware)
         i. POST /api/sessions/*    -- SessionsController (Unit 4, AuthMiddleware)
         j. GET  /api/sessions/*    -- SessionsController (Unit 4, AuthMiddleware)
         k. GET  /api/notes/*       -- NotesController (Unit 5, AuthMiddleware)
         l. PUT  /api/notes/*       -- NotesController (Unit 5, AuthMiddleware)
         |
         v
8. ErrorMiddleware registered (LAST — must be after all routes)
         |
         v
9. app.listen(PORT)
         |
         v
Server ready — log: "Server listening on port {PORT}"
```

---

## Request Lifecycle

```
Incoming HTTP request
         |
         v
express.json() -- parse body
         |
         v
cookie-parser -- extract cookies into req.cookies
         |
         v
cors() -- validate Origin header against FRONTEND_URL
         |         +-- Origin not allowed --> 403 (CORS block, no body)
         |
         v
Route match
         |
         +--[ /health ]----> HealthController.check()
         |                         |
         |                    SELECT 1 query
         |                         |
         |                    200 { status: "ok", db: "connected" }
         |                    OR
         |                    503 { status: "degraded", db: "unreachable" }
         |
         +--[ /auth/* ]----> AuthController (no AuthMiddleware -- Unit 2)
         |
         +--[ /api/* ]----> AuthMiddleware
                                 |
                    +-- No cookie or invalid JWT
                    |         |
                    |         v
                    |    401 { error: { code: "UNAUTHORIZED", message: "..." } }
                    |
                    +-- Valid JWT
                              |
                              v
                         req.user = { id: userId }
                              |
                              v
                         Route handler (Controller)
                              |
                              v
                         Service (business logic)
                              |
                              v
                         Repository (DB access via Prisma)
                              |
                              v
                         JSON response sent
                              |
         +--------------------+
         |
         v (if any handler throws)
ErrorMiddleware(err, req, res, next)
         |
         v
Map error to { code, httpStatus }   -- BR-02
         |
         v
Log error server-side
         |
         v
res.status(httpStatus).json({ error: { code, message } })
```

---

## Middleware Registration Order Rule

**CRITICAL**: Express identifies `ErrorMiddleware` by its 4-argument signature `(err, req, res, next)`. It must be registered **after all routes** — registering it before any route means errors from those routes will not reach it.

Correct order:
```
app.use(bodyParser)
app.use(cookieParser)
app.use(cors)
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/api', apiRouter)           ← all /api routes here
app.use(errorMiddleware)             ← ALWAYS LAST
```

---

## ContentService Initialization

`ContentService.initialize()` runs once at startup (step 4), before the HTTP server starts. It builds an in-memory index of all units and exercises by reading the filesystem at `CONTENT_PATH`.

**Index structure**:
```
{
  units: [
    {
      slug: "docker",
      name: "Docker",
      exercises: [
        { slug: "01-build-your-first-container", name: "Build Your First Container", files: ["README.md", "challenge.md", "resources.md"] },
        ...
      ]
    },
    ...
  ]
}
```

**Cache strategy**: Index is immutable after initialization — no refresh during server lifetime. File content is cached on first read (lazy, per-file). Restart the server to pick up new content from `devops-challenges/`.

---

## PrismaClient Singleton

One `PrismaClient` instance is created at startup and shared across all repositories. Connection pooling is managed by Prisma's internal pool.

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
})
export default prisma
```

Repositories import `prisma` from `lib/prisma.ts` — they do not create their own client instances.
