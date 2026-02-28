# Tech Stack Decisions — Unit 3: content-api

## No New Packages
Unit 3 uses only Node.js built-ins. Zero additions to `package.json`.

| Module | Role |
|--------|------|
| `node:fs` | Directory scanning, file reads |
| `node:path` | Safe path construction (`path.join`) |

## Decision: Synchronous File Reads
`fs.readFileSync` chosen over `fs.promises.readFile`. Rationale: files are small (~5–15KB), only read once each (then cached), and the app serves 2–5 users. Async adds complexity with no meaningful benefit at this scale.

## Decision: Singleton Service Object
`ContentService` exported as a module-level singleton (object literal, same pattern as `userRepository` and `authService`). No class instantiation required — `initialize()` mutates the module-level `Map` instances.
