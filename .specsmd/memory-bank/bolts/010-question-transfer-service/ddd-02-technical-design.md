---
unit: 001-question-transfer-service
bolt: 010-question-transfer-service
stage: design
status: complete
updated: 2026-03-06T08:35:20Z
---

# Technical Design - Question Transfer Service (Apply + Idempotency)

## Architecture Pattern

Incremental layered extension on top of bolt 009:
- Controller: request parsing and error responses
- Service: mode-aware orchestration (`dry-run` and `apply`)
- Domain utility: normalization + deterministic fingerprinting
- Repository: lookup + chunked insert transaction

## Layer Structure

```text
QuestionTransferController
        ↓
QuestionTransferService
  ├─ validateImport (existing)
  └─ applyImport (new)
        ↓
Fingerprint + DuplicateDetection helpers
        ↓
QuestionRepository (find existing + save batch)
        ↓
PostgreSQL (Prisma)
```

## API Design

### Import Endpoint (extended)
- **Endpoint**: `POST /api/v1/questions/import`
- **Auth**: required
- **Body**:
  - `mode`: `dry-run | apply`
  - `csv`: CSV payload string
- **Behavior**:
  - `dry-run`: validate only, no writes
  - `apply`: validate + dedup + persist valid non-duplicate rows

### Response Contract (stable for both modes)

```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalRows": 100,
      "validRows": 90,
      "invalidRows": 10,
      "insertedRows": 80,
      "duplicateRows": 10,
      "mode": "apply"
    },
    "issues": [
      {
        "rowIndex": 12,
        "field": "type",
        "code": "INVALID_ENUM",
        "message": "type must be theory or scenario"
      }
    ]
  }
}
```

## Apply-Mode Processing Pipeline

1. Parse CSV and normalize rows.
2. Run field-level validation.
3. Build deterministic fingerprint per valid row:
   - `normalize(text)` + `type` + `difficulty` + `experience_level` + `sorted(topics)`
4. Detect duplicates:
   - Intra-file duplicates (same fingerprint within current upload)
   - Existing DB duplicates (fingerprint-equal logical row already in question bank)
5. Build write set (valid, non-duplicate rows only).
6. Persist write set in transaction chunks.
7. Build summary counts and return stable report payload.

## Data Persistence Design

- Reuse existing `Question` + `QuestionTopic` schema.
- For each inserted row:
  - create `Question`
  - create associated `QuestionTopic[]`
- Chunk size default: 200 rows/transaction chunk.
- On per-row conflict/failure inside chunk:
  - classify row as failed or duplicate as applicable
  - continue processing remaining rows when safe

## Idempotency Design

Fingerprint algorithm:
- `textNormalized = trim + lowercase + collapse spaces`
- `topicsNormalized = sorted(unique(topics))`
- composite string: `textNormalized|type|difficulty|experience_level|topicsNormalized.join(',')`
- hash function: deterministic (sha256)

Idempotency guarantee:
- repeated imports of identical logical rows produce same fingerprints
- rows with existing fingerprints are skipped as duplicates
- `duplicateRows` count reflects both batch and DB duplicates

## Validation and Error Strategy

- Preserve all dry-run validation rules from bolt 009.
- Apply mode inherits validation issues and never writes invalid rows.
- Error output schema remains unchanged.
- Unknown mode returns `400 BAD_REQUEST`.

## NFR Design

- Target: 1,000-row apply under 8s with chunked inserts.
- Response payload issue list may be capped for very large invalid sets while keeping full aggregates.
- Keep implementation deterministic for test reproducibility.

## Security Design

- Import route remains behind auth middleware.
- No CSV payload logging.
- Defensive parsing to prevent malformed-line crashes.

## Test Design

Unit tests:
- fingerprint normalization deterministic behavior
- duplicate classification (batch + DB)
- summary aggregation correctness

Integration tests:
- apply inserts only valid non-duplicates
- repeated apply is idempotent
- response contract shape stable across dry-run and apply

## Implementation Boundary for Bolt 010

Included:
- `apply` mode implementation
- deterministic fingerprint + duplicate detection
- persistence + summary contract
- tests for idempotency and reporting

Out of scope:
- binary file upload multipart parser changes
- downloadable error artifact
