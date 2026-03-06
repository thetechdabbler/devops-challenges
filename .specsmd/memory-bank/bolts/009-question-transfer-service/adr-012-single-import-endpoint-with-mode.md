---
id: adr-012
bolt: 009-question-transfer-service
title: Single Import Endpoint with Explicit Mode
status: accepted
date: 2026-03-06T08:08:30Z
---

# ADR-012: Single Import Endpoint with Explicit Mode

## Context

The import workflow must support two behaviors:
- `dry-run` validation with no persistence
- `apply` persistence for valid non-duplicate rows (implemented in next bolt)

We need a stable API contract for frontend integration while minimizing endpoint sprawl and avoiding diverging payload formats.

## Decision

Use a single endpoint:
- `POST /api/v1/questions/import`

Require a `mode` parameter with values:
- `dry-run`
- `apply`

In bolt `009`, only `dry-run` behavior is implemented, but response contract is designed to support both modes.

## Consequences

### Positive
- Stable request/response contract across both modes.
- Simplifies frontend integration and reduces duplicate code paths.
- Avoids version drift between separate dry-run and apply endpoints.

### Negative
- Endpoint handler must branch by mode and validate mode-specific behavior.
- Requires clear guardrails so `dry-run` never writes.

## Alternatives Considered

1. Separate endpoints (`/import/validate` and `/import/apply`)
   - Rejected due to duplicated request schema and higher maintenance overhead.

2. Implicit mode based on query string or route
   - Rejected due to reduced clarity and weaker contract typing.
