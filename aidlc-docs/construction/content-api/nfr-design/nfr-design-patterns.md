# NFR Design Patterns — Unit 3: content-api

## Pattern 1 — Lazy Read-Through Cache
First request reads from disk and populates the cache. All subsequent requests for the same key hit only the in-memory Map.
```
getFileContent(unit, exercise, file):
  key = `${unit}/${exercise}/${file}`
  if fileCache.has(key): return fileCache.get(key)   // cache hit — O(1)
  content = fs.readFileSync(path.join(CONTENT_PATH, unit, exercise, file), 'utf-8')
  fileCache.set(key, content)
  return content
```

## Pattern 2 — Allowlist Validation (Defence-in-Depth)
Validate params against the known index before any filesystem access. Unknown values never reach `path.join`.
```
if !contentIndex.has(unit)             → throw NotFoundError
if !contentIndex.get(unit).has(exercise) → throw NotFoundError
if /[\/\\]|\.\./.test(file)            → throw NotFoundError  // traversal guard
if !fs.existsSync(filePath)            → throw NotFoundError
```

## Pattern 3 — Fail-Fast Initialization
If the content directory is absent at startup, the server exits immediately rather than running in a degraded state where all content requests would 404.
```
initialize():
  if !fs.existsSync(CONTENT_PATH):
    log.fatal("CONTENT_PATH not found")
    process.exit(1)
```
