---
unit: 001-question-transfer-service
bolt: 009-question-transfer-service
stage: design
status: complete
updated: 2026-03-06T08:05:10Z
---

# Technical Design - Question Transfer Service

## Architecture Pattern

Layered service architecture aligned with existing backend structure:
- Controller layer for request/response handling.
- Service layer for import/export orchestration.
- Repository layer for data access through Prisma.
- Utility layer for CSV parsing/serialization and row normalization.

## Layer Structure

```text
HTTP Routes/Controllers
        ↓
QuestionTransferService
  ├─ ExportService
  └─ ImportValidationService
        ↓
Repositories (QuestionRepository)
        ↓
PostgreSQL (Prisma)
```

## API Design

### 1) Export Questions
- **Endpoint**: `GET /api/v1/questions/export`
- **Auth**: required (any authenticated user)
- **Query Params**:
  - `topics` (comma-separated)
  - `type` (`theory|scenario`)
  - `difficulty` (`1-5`)
  - `experience_level` (`junior|mid|senior`)
  - `status` (`active|pending_review|rejected`)
- **Response**:
  - `200 text/csv` with attachment filename `questions-export-{timestamp}.csv`

### 2) Import Questions (Dry-Run for this bolt)
- **Endpoint**: `POST /api/v1/questions/import`
- **Auth**: required
- **Content-Type**: `multipart/form-data`
- **Body Fields**:
  - `file` (CSV)
  - `mode` (`dry-run` in this bolt; `apply` in next bolt)
- **Response (`200 application/json`)**:
  - `summary`: `{ totalRows, validRows, invalidRows, insertedRows, duplicateRows, mode }`
  - `issues`: array of `{ rowIndex, field, code, message }`

## Request/Response Contract (Dry-Run)

```json
{
  "summary": {
    "totalRows": 100,
    "validRows": 90,
    "invalidRows": 10,
    "insertedRows": 0,
    "duplicateRows": 0,
    "mode": "dry-run"
  },
  "issues": [
    {
      "rowIndex": 14,
      "field": "difficulty",
      "code": "INVALID_ENUM",
      "message": "difficulty must be between 1 and 5"
    }
  ]
}
```

## Data Model and Mapping

### Export/Import CSV Columns (MVP)
1. `text`
2. `topics` (delimiter `|`)
3. `type`
4. `difficulty`
5. `experience_level`
6. `answer`
7. `explanation`
8. `key_concepts` (delimiter `|`)
9. `status`

### Normalization Rules
- Trim leading/trailing whitespace for all scalar text fields.
- Normalize topics and key concepts by split, trim, dedup, and stable sort.
- Normalize `type`, `experience_level`, `status` to lowercase.
- Parse `difficulty` to integer and validate range.

## Validation Design (Dry-Run)

Validation pipeline per row:
1. Structural validation (required headers present).
2. Field presence and non-empty checks.
3. Enum and range validation.
4. List parsing validation (`topics`, `key_concepts`).
5. Build normalized row for downstream processing.

Rules for this bolt:
- Dry-run never performs DB writes.
- Invalid rows accumulate in `issues` with row index and reason.
- Summary counts must be deterministic and reproducible.

## Security and Safety

- Endpoint access behind existing auth middleware.
- File size limits enforced at middleware layer.
- MIME and extension checks for CSV inputs.
- No raw file content logged.

## NFR Design

- Stream or chunk parse CSV for large files.
- For dry-run, keep only capped issue sample in response if issues exceed threshold; always return full aggregates.
- Target: 1,000 rows validated in < 5s.

## Integration Plan

- Reuse existing question enums/types from current domain model.
- Add transfer routes under existing backend routing namespace.
- Add unit tests for:
  - export filter mapping
  - CSV parse + normalization
  - dry-run validation summary + issues

## Implementation Boundary for Bolt 009

Included in bolt 009:
- Export endpoint and CSV generation.
- Import endpoint in `dry-run` mode.
- Parser + validator + summary contract.

Deferred to bolt 010:
- `apply` persistence mode.
- Idempotent fingerprint and duplicate-skip behavior.
- Transaction chunking for inserts.
