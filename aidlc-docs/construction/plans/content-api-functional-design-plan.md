# Functional Design Plan — Unit 3: content-api

## Scope

Serves the `devops-challenges/` content directory over HTTP. All routes are protected by `AuthMiddleware` from Unit 2. `CONTENT_PATH` env var (already required) points to the content root.

Builds on: Unit 2 (`AuthMiddleware` must exist)

---

## Plan Checklist

- [x] Analyze unit context
- [x] Collect design decisions
- [x] Generate domain-entities.md
- [x] Generate business-rules.md
- [x] Generate business-logic-model.md
- [ ] Present for approval

---

## Questions

**Q1 — `GET /api/content/units` response shape**
The units index is built once at startup by scanning `CONTENT_PATH`. How much data should it include?

A) Unit + exercises only — `{ unit: string, exercises: string[] }[]`
B) Unit + exercises + files per exercise — `{ unit: string, exercises: { name: string, files: string[] }[] }[]`

[Answer]:

**Q2 — Path traversal prevention**
The `:unit`, `:exercise`, and `:file` route params are used to build a filesystem path. Should the service validate these params against the known units index to block path traversal attempts (e.g., `../../etc/passwd`)?

A) Yes — validate all three params against the scanned index before reading; throw `NotFoundError` on any unknown value
B) No — rely on `path.join` sandboxing within `CONTENT_PATH`; simpler implementation

[Answer]:
