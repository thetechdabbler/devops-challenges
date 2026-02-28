# Code Summary — Unit 3: content-api

## Files Created

| File | Purpose |
|------|---------|
| `src/services/content.service.ts` | `initialize()`, `getUnitsIndex()`, `getFileContent()` with lazy cache |
| `src/controllers/content.controller.ts` | `listUnits`, `getFile` |
| `src/routes/content.routes.ts` | `GET /units`, `GET /:unit/:exercise/:file` |
| `src/__tests__/content.service.test.ts` | 6 tests — init, fail-fast, NotFoundError variants, cache behaviour |
| `src/__tests__/content.controller.test.ts` | 3 tests — listUnits, getFile success, error propagation |

## Files Modified

| File | Change |
|------|--------|
| `src/index.ts` | `contentService.initialize()` call + `app.use('/api/content', authenticate, contentRouter)` |

## Story Coverage

| Requirement | Covered By |
|-------------|-----------|
| FR-01 Exercise Browsing | `GET /api/content/units` → `{ units: UnitMeta[] }` |
| FR-02 Content Viewer | `GET /api/content/:unit/:exercise/:file` → `{ content: string }` |
| NFR-01 Performance | FileCache — lazy Map, cache-hit after first read |
| NFR-02 Security | `AuthMiddleware` on all content routes; allowlist param validation |
| NFR-04 Reliability | `NotFoundError` on bad params; `process.exit(1)` if `CONTENT_PATH` missing |
