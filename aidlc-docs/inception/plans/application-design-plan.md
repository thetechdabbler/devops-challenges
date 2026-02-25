# Application Design Plan — DevOps Practice Portal

## Design Artifacts to Generate

- [x] components.md — component definitions and responsibilities
- [x] component-methods.md — method signatures per component
- [x] services.md — service definitions and orchestration patterns
- [x] component-dependency.md — dependency relationships and data flow

---

## Proposed Component Architecture

### Backend Components

```
+----------------------------------------------------------+
|                   Express API Server                     |
|  +--------------------+  +---------------------------+   |
|  |  Auth Controller   |  |   Content Controller      |   |
|  +--------------------+  +---------------------------+   |
|  +--------------------+  +---------------------------+   |
|  | Progress Controller|  |   Notes Controller        |   |
|  +--------------------+  +---------------------------+   |
|  +--------------------+                                  |
|  | Sessions Controller|                                  |
|  +--------------------+                                  |
+----------------------------------------------------------+
         |                           |
         v                           v
+--------------------+    +----------------------+
|   Service Layer    |    |   devops-challenges/ |
|  - ContentService  |    |   (filesystem)       |
|  - ProgressService |    +----------------------+
|  - SessionService  |
|  - NoteService     |
+--------------------+
         |
         v
+--------------------+
|  Repository Layer  |
|  - UserRepo        |
|  - ProgressRepo    |
|  - SessionRepo     |
|  - NoteRepo        |
+--------------------+
         |
         v
+--------------------+
|    PostgreSQL      |
+--------------------+
```

### Frontend Components

```
+----------------------------------------------------------+
|                    React SPA (Vite)                      |
|  +---------+  +----------+  +-----------+               |
|  |AuthPages|  |AppLayout |  | Dashboard |               |
|  +---------+  +----------+  +-----------+               |
|               |                                         |
|        +------+-------+                                 |
|        |              |                                 |
|  +----------+  +----------------+                       |
|  |Unit List |  | Exercise Viewer|                       |
|  +----------+  +----------------+                       |
|                |       |       |                        |
|           +----+  +----+  +---+                         |
|           |       |       |                             |
|      +--------+ +-------+ +-----------+                 |
|      | Timer  | |Status | | Notes     |                 |
|      | Widget | |Select | | Editor    |                 |
|      +--------+ +-------+ +-----------+                 |
+----------------------------------------------------------+
```

---

## Design Questions

Three decisions need your input before generating the design artifacts.

---

## Question 1
What React state management approach should be used for shared state (current user, progress data, active session)?

A) React Context API + useReducer — built-in, no extra dependency, sufficient for this app size
B) Zustand — lightweight external store, minimal boilerplate, easy async
C) Redux Toolkit — full-featured, more boilerplate, best for larger apps
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
What should the notes markdown editor look like?

A) Simple — plain textarea input on the left, rendered markdown preview on the right (split pane)
B) Rich — CodeMirror or Monaco editor with syntax highlighting, rendered preview toggle
C) Minimal — just a textarea, no live preview (rendered only on save/blur)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3
What database access pattern should the backend use?

A) Raw `pg` driver with hand-written SQL — full control, zero abstraction, lightweight
B) Knex.js — SQL query builder + migrations, minimal ORM overhead
C) Prisma — full ORM with type-safe client, schema-first, auto-generates types for TypeScript
D) Other (please describe after [Answer]: tag below)

[Answer]: C

