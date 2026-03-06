---
bolt: 001-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-001: Junction Table for Multi-Topic Questions

## Context

The DevOps interview bot requires questions to be associated with one or more topics (e.g., a question about deploying a Docker app to Kubernetes belongs to both Docker and Kubernetes). When a user selects one of those topics for their session, the question should be eligible for delivery.

Two approaches were evaluated for storing topic associations on questions in SQLite with Drizzle ORM:

1. **JSON column** — store `topics` as a JSON array directly on the `questions` table
2. **Junction table** — a separate `question_topics` table with a composite primary key (question_id, topic)

The choice affects query patterns, indexing, and how future agents filter questions.

## Decision

Use a dedicated **`question_topics` junction table** with a composite primary key `(question_id, topic)` and an index on `topic`. Topic associations are managed as separate rows, not as a JSON blob on the questions row.

## Rationale

The primary driver is **query efficiency and indexability**. SQLite cannot index into JSON arrays — filtering `WHERE topics CONTAINS 'Docker'` on a JSON column requires a full table scan or a JSON function that cannot use standard B-tree indexes. The junction table approach allows a standard indexed `WHERE topic IN (...)` query.

The **ANY-match semantic** (a question is eligible if it has ANY of the user's selected topics) is naturally expressed as a JOIN with `IN (...)`, combined with `SELECT DISTINCT` to prevent duplicate rows when a question matches multiple selected topics.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| JSON column (`topics TEXT`) | Simpler schema, single row per question | Cannot be indexed; requires JSON functions for filtering; full table scan at scale | Performance degrades as question bank grows; not indexable in SQLite |
| Comma-separated string | Simplest storage | Same indexing problem as JSON; fragile parsing; no referential integrity | Worse than JSON; no type safety |
| Junction table (chosen) | Indexed filtering; standard relational pattern; referential integrity; DISTINCT handles multi-match cleanly | Slightly more complex inserts (must write to two tables) | None — chosen approach |

## Consequences

### Positive

- `WHERE topic IN (...)` query is fully indexed via `idx_question_topics_topic`
- `SELECT DISTINCT` cleanly prevents duplicate results when a question matches multiple selected topics
- Referential integrity enforced at DB level (`ON DELETE CASCADE` from questions)
- Easy to add or remove topics from a question without rewriting the question row
- Standard SQL pattern — any future agent can understand and extend it

### Negative

- Creating a question requires writing to two tables (questions + question_topics)
- Batch inserts must handle both tables — slightly more complex repository implementation
- `saveBatch` must insert question_topics rows for each generated question

### Risks

- **Forgotten junction rows**: If a question is inserted without any question_topics entry, it becomes unreachable by `findByConfig`. Mitigated by: validation in the repository `save()` function (assert `topics.length >= 1` before insert), and unit tests covering this invariant.

## Related

- **Stories**: 001-question-schema-and-storage, 002-question-lookup-by-config
- **Standards**: Not in current standards — this pattern applies specifically to multi-value enum filtering in SQLite
- **Previous ADRs**: None
