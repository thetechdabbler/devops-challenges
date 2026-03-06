---
unit: 001-question-transfer-service
bolt: 009-question-transfer-service
stage: model
status: complete
updated: 2026-03-06T08:01:30Z
---

# Static Model - Question Transfer Service

## Bounded Context

The Question Transfer bounded context handles import and export of interview question content as portable CSV while guaranteeing deterministic idempotency and strict data validation.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| QuestionTransferRow | rowIndex, text, topics[], type, difficulty, experienceLevel, answer, explanation, keyConcepts[], status | Must contain all required fields; topics normalized and sorted for deterministic processing |
| ImportRun | id, requestedBy, mode, startedAt, completedAt, totals(valid/invalid/inserted/duplicates) | `mode` is `dry-run` or `apply`; dry-run cannot persist rows |
| ValidationIssue | rowIndex, field, code, message | Every invalid row must have at least one issue with actionable message |
| DedupFingerprint | fingerprint, normalizedText, normalizedTopics, type, difficulty, experienceLevel | Same logical row must generate same fingerprint across repeated imports |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| CsvExportFilter | topics[], type, difficulty, experienceLevel, status | Optional fields; invalid enum values rejected |
| ImportMode | value (`dry-run` or `apply`) | Only two supported values |
| QuestionFingerprint | hashSource, hashValue | hashSource fields must be normalized deterministically |
| ImportSummary | totalRows, validRows, invalidRows, insertedRows, duplicateRows | Counts are non-negative and totalRows = validRows + invalidRows |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| ImportRun | QuestionTransferRow, ValidationIssue, ImportSummary | A run has one mode; apply writes only valid non-duplicate rows; dry-run writes zero rows |
| QuestionTransferCatalog | CsvExportFilter, exported rows | Export output schema and column order remain stable |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| QuestionsExported | Export request completes | requestedBy, filter, exportedRowCount |
| ImportValidationCompleted | Dry-run validation finishes | requestedBy, totalRows, validRows, invalidRows, issuesSample |
| ImportApplied | Apply import finishes | requestedBy, insertedRows, duplicateRows, invalidRows |
| DuplicateRowsDetected | Duplicate fingerprints found during apply | requestedBy, duplicateCount, sampleRowIndexes |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| QuestionExportService | buildExportFilter, fetchRows, serializeCsv | Question repository, csv serializer |
| QuestionImportValidationService | parseCsv, normalizeRow, validateRow, summarizeValidation | csv parser, enum validators |
| QuestionImportApplyService | buildFingerprint, detectDuplicate, persistValidRows, summarizeApply | Prisma transaction, question repository |
| ImportSummaryService | formatSummary, capIssuePayload | validation/apply services |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| QuestionRepository | QuestionTransferRow | findByExportFilter(filter), findByFingerprint(fingerprint), bulkInsert(rows) |
| ImportRunRepository (optional, log-backed for MVP) | ImportRun | createRun(meta), finalizeRun(summary) |

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Portability Export | CSV output that can be re-imported in another environment |
| Dry-Run Import | Validation-only import that performs no database writes |
| Apply Import | Import mode that persists valid non-duplicate rows |
| Idempotent Import | Re-running same logical dataset causes no duplicate inserts |
| Fingerprint | Deterministic dedup key derived from normalized row fields |
| Validation Issue | Row-level failure describing why a row is invalid |
