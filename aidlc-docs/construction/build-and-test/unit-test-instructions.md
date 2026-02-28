# Unit Test Execution — Unit 1: setup

## Overview

Unit 1 provides 3 test suites covering all infrastructure-layer logic. All tests are fully isolated — no database or network required.

| Suite | File | Tests |
|-------|------|-------|
| AppError subclasses | `src/__tests__/errors.test.ts` | 5 |
| validateEnv | `src/__tests__/env.test.ts` | 8 |
| health.controller | `src/__tests__/health.controller.test.ts` | 2 |
| **Total** | | **16** |

## Run Unit Tests

```bash
cd portal/backend
npm test
```

### Expected Output

```
PASS src/__tests__/errors.test.ts
PASS src/__tests__/health.controller.test.ts
PASS src/__tests__/env.test.ts

Test Suites: 3 passed, 3 total
Tests:       16 passed, 16 total
Time:        ~3s
```

> **Note on FATAL log lines**: `env.test.ts` intentionally deletes env vars one-by-one to assert `process.exit(1)` is called. The pino logger emits FATAL messages to stdout as part of the tested code path — this is expected and correct. All tests still pass.

## What Each Suite Tests

### errors.test.ts
Verifies each `AppError` subclass sets the correct `statusCode` and `code` string:
- `NotFoundError` → `statusCode: 404`, `code: 'NOT_FOUND'`
- `UnauthorizedError` → `statusCode: 401`, `code: 'UNAUTHORIZED'`
- `ForbiddenError` → `statusCode: 403`, `code: 'FORBIDDEN'`
- `BadRequestError` → `statusCode: 400`, `code: 'BAD_REQUEST'`
- `InternalError` → `statusCode: 500`, `code: 'INTERNAL_ERROR'`

### env.test.ts
Verifies `validateEnv()` behaviour:
- Passes without throwing when all 7 required vars are set
- Calls `process.exit(1)` for each individually missing var (7 parameterised cases)

### health.controller.test.ts
Mocks `prisma.$queryRaw` to test both branches:
- DB reachable → `res.status(200).json({ status: 'ok', db: 'connected' })`
- DB throws → `res.status(503).json({ status: 'degraded', db: 'unreachable' })`

## Re-run in Watch Mode (Development)

```bash
npm run test:watch
```

## Fix Failing Tests

If tests fail after code changes:
1. Read the failure message — Jest outputs the exact assertion that failed
2. Check that mocks in test files match the actual implementation signatures
3. After any schema change, run `npx prisma generate` before re-running tests
4. Re-run `npm test` until all 16 pass
