---
unit: 001-question-transfer-service
bolt: 010-question-transfer-service
stage: model
status: complete
updated: 2026-03-06T08:31:10Z
---

# Static Model - Question Transfer Service (Apply + Idempotency)

## Bounded Context

This bolt extends the Question Transfer context from validation-only into apply-mode persistence with deterministic idempotency, duplicate detection, and stable result reporting.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| NormalizedImportRow | rowIndex, textNormalized, topicsSorted, type, difficulty, experienceLevel, answer, explanation, keyConcepts, status | Canonical shape must be deterministic and reusable for fingerprinting |
| ImportFingerprintRecord | fingerprint, rowIndex, existsInBank, isDuplicateInBatch | Same logical question must map to same fingerprint regardless of field order/whitespace |
| ImportApplyResult | insertedCount, duplicateCount, invalidCount, failedCount, mode | Summary counts must reflect exactly one terminal outcome per row |
| PersistableQuestion | text, type, difficulty, experienceLevel, answer, explanation, keyConcepts, topics, status | Persist only if valid and not duplicate |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| DeterministicFingerprint | hashInput, hashValue | hashInput uses normalized text + type + difficulty + experience level + sorted unique topics |
| ApplyModePolicy | mode, allowWrite | `mode=apply` implies allowWrite=true; dry-run remains write-forbidden |
| ImportErrorItem | rowIndex, code, field, message, severity | Must be serializable and stable for UI contract |
| BatchInsertChunk | chunkIndex, rows[] | Chunk size bounded (e.g., 200 rows) to avoid oversized transactions |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| ImportApplyRun | NormalizedImportRow, ImportFingerprintRecord, ImportErrorItem, ImportApplyResult | A row may be inserted OR marked duplicate OR marked invalid/failed, never multiple outcomes |
| QuestionBankWriteSet | PersistableQuestion[], insertedIds[] | Only valid non-duplicate rows are written; each inserted row has associated topics |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| ImportApplyStarted | apply request accepted | requestedBy, totalRows, chunkSize |
| FingerprintComputed | fingerprint generated for row | rowIndex, fingerprint |
| DuplicateSkipped | row marked duplicate | rowIndex, fingerprint, duplicateType(batch|database) |
| ImportRowPersisted | row successfully inserted | rowIndex, questionId |
| ImportApplyCompleted | apply operation finished | summary counts, durationMs |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| FingerprintService | normalizeForHash, buildFingerprint | stable normalization helpers, hash function |
| DuplicateDetectionService | detectBatchDuplicates, detectDatabaseDuplicates | in-memory set, repository fingerprint lookup |
| ImportApplyService | planWriteSet, executeChunkedInsert, buildApplySummary | QuestionRepository, Prisma transaction |
| ImportResultService | mergeValidationAndApplyOutcomes, shapeApiResponse | validation output, apply outcomes |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| QuestionRepository | PersistableQuestion | bulkInsertTransferRows(rows), findExistingByFingerprintCandidates(candidates), createQuestionWithTopics(row) |
| ImportRunRepository (optional) | ImportApplyRun | createStartRecord(meta), finalizeRun(summary) |

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Apply Mode | Import mode that writes valid non-duplicate rows to the bank |
| Deterministic Fingerprint | Stable hash used to enforce idempotent duplicate detection |
| Batch Duplicate | Duplicate found within the same uploaded file |
| Database Duplicate | Duplicate of an already persisted logical question |
| Write Set | Final list of rows eligible for insertion in this run |
| Outcome Partition | Mutually exclusive classification of each row (inserted/duplicate/invalid/failed) |
