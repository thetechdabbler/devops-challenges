---
id: adr-013
bolt: 010-question-transfer-service
title: Deterministic Fingerprint for Idempotent Imports
status: accepted
date: 2026-03-06T08:41:00Z
---

# ADR-013: Deterministic Fingerprint for Idempotent Imports

## Context

Apply-mode import must be idempotent. Re-importing logically identical rows should not create duplicates. Raw text equality alone is insufficient because topic order, whitespace, and case variations can represent the same logical question.

## Decision

Use a deterministic fingerprint as the idempotency key for each normalized import row.

Fingerprint input fields:
- normalized question text (trim/lowercase/collapsed whitespace)
- type
- difficulty
- experience level
- sorted unique topics

Persist/compare fingerprint-equivalent rows as duplicates and skip inserts.

## Consequences

### Positive
- Strong idempotency guarantees across repeated imports.
- Predictable duplicate counting and stable behavior.
- Handles formatting differences (topic order/whitespace/case) consistently.

### Negative
- Potential false positives if different questions normalize identically.
- Requires careful normalization test coverage.

## Alternatives Considered

1. Exact raw field match without normalization
   - Rejected due to weak idempotency under harmless formatting differences.

2. Semantic similarity/embedding-based deduplication
   - Rejected for MVP due to complexity and non-determinism.
