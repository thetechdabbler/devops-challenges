# Business Logic Model — Unit 3: content-api

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `ContentService` | Filesystem scanning, index building, file cache management |
| `ContentController` | HTTP layer — list units, serve file content |
| `content.routes.ts` | Route wiring with `AuthMiddleware` |

---

## Startup Sequence (addition to Unit 1 startup)

```
main()
  validateEnv()
  connectWithRetry()
  ContentService.initialize()   ← NEW in Unit 3
    scan CONTENT_PATH
    build ContentIndex
    log "Content index built: 8 units, 80 exercises"
  app = express()
  ... middleware ...
  register routes
```

---

## ContentService Pseudocode

```
class ContentService:
  contentIndex: Map<string, Set<string>> = new Map()
  fileCache: Map<string, string> = new Map()

  initialize():
    if !fs.existsSync(CONTENT_PATH):
      log.fatal("CONTENT_PATH does not exist: " + CONTENT_PATH)
      process.exit(1)

    units = fs.readdirSync(CONTENT_PATH, { withFileTypes: true })
              .filter(d => d.isDirectory())
              .map(d => d.name)
              .sort()

    for unit of units:
      exercises = fs.readdirSync(path.join(CONTENT_PATH, unit), { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name)
                    .sort()
      contentIndex.set(unit, new Set(exercises))

    log.info("Content index built", { units: units.length, totalExercises: ... })

  getUnitsIndex(): UnitMeta[]:
    return Array.from(contentIndex.entries()).map(([unit, exercises]) => ({
      unit,
      exercises: Array.from(exercises)
    }))

  getFileContent(unit, exercise, file): string:
    // 1. Validate unit
    if !contentIndex.has(unit):
      throw NotFoundError("Unit not found: " + unit)

    // 2. Validate exercise
    if !contentIndex.get(unit).has(exercise):
      throw NotFoundError("Exercise not found: " + exercise)

    // 3. Validate file param — no path separators or traversal
    if file.includes('/') || file.includes('\\') || file.includes('..'):
      throw NotFoundError("File not found")

    // 4. Check cache
    cacheKey = `${unit}/${exercise}/${file}`
    if fileCache.has(cacheKey):
      return fileCache.get(cacheKey)

    // 5. Read from disk
    filePath = path.join(CONTENT_PATH, unit, exercise, file)
    if !fs.existsSync(filePath):
      throw NotFoundError("File not found: " + file)

    content = fs.readFileSync(filePath, 'utf-8')
    fileCache.set(cacheKey, content)
    return content
```

---

## ContentController Pseudocode

```
listUnits(req, res):
  units = contentService.getUnitsIndex()
  res.json({ units })

getFile(req, res):
  { unit, exercise, file } = req.params
  content = contentService.getFileContent(unit, exercise, file)
  res.json({ content })
  // NotFoundError bubbles up to ErrorMiddleware → 404 JSON
```

---

## Request Flow

```
GET /api/content/units
  → AuthMiddleware (verifies auth_token cookie)
  → ContentController.listUnits
  → ContentService.getUnitsIndex()   ← pure in-memory read
  → 200 { units: UnitMeta[] }

GET /api/content/docker/01-build-your-first-container/challenge.md
  → AuthMiddleware
  → ContentController.getFile
  → ContentService.getFileContent("docker", "01-build-your-first-container", "challenge.md")
      → validate unit ✓
      → validate exercise ✓
      → validate file param (no traversal) ✓
      → cache miss → fs.readFileSync → cache set
      → return content string
  → 200 { content: "# Challenge..." }

(second request for same file)
  → ContentService.getFileContent(...)
      → cache hit → return content
  → 200 { content: "# Challenge..." }  ← no filesystem read
```

---

## Files to Create (Unit 3)

| File | Component |
|------|-----------|
| `src/services/content.service.ts` | `ContentService` singleton |
| `src/controllers/content.controller.ts` | `ContentController` |
| `src/routes/content.routes.ts` | Route wiring |

### File to Update (Unit 1)
| File | Change |
|------|--------|
| `src/index.ts` | Call `ContentService.initialize()` at startup; register content routes |
