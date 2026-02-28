# Domain Entities — Unit 3: content-api

## Value Objects (no DB persistence — filesystem only)

### UnitMeta
The response shape for `GET /api/content/units`. Built once at startup from directory scan.

| Field | Type | Example |
|-------|------|---------|
| `unit` | string | `"docker"` |
| `exercises` | string[] | `["01-build-your-first-container", "02-multi-stage-builds", ...]` |

### ContentIndex
In-memory data structure built by `ContentService.initialize()`. Represents the validated set of known units and exercises — used for param validation on every file request.

```
ContentIndex: Map<unit: string, exercises: Set<string>>
```

### FileCache
In-memory cache built lazily on first file read. Lives for the server process lifetime (cleared on restart).

```
FileCache: Map<cacheKey: string, content: string>
cacheKey format: "${unit}/${exercise}/${file}"
```

### ContentFile
The response shape for `GET /api/content/:unit/:exercise/:file`.

| Field | Type | Notes |
|-------|------|-------|
| `content` | string | Raw file content — not parsed; frontend renders markdown |

---

## Filesystem Layout (read-only)

```
CONTENT_PATH/                     ← env var: absolute path to devops-challenges/
├── docker/
│   ├── 01-build-your-first-container/
│   │   ├── challenge.md
│   │   ├── README.md
│   │   └── resources.md
│   └── 02-multi-stage-builds/
│       └── ...
├── kubernetes/
│   └── ...
└── ... (8 units × 10 exercises)
```

The service never writes to `CONTENT_PATH`. All access is read-only (`fs.readFile`).

---

## No Prisma Models

Unit 3 has no database entities. All data is sourced from the filesystem at `CONTENT_PATH`.
