---
intent: 003-admin-question-management
phase: inception
status: draft
created: 2026-03-06T08:40:22Z
updated: 2026-03-06T08:40:22Z
---

# System Context: Reviewer Question Management

## Actors

- **Reviewer** (Human): Creates, updates, archives, and audits question records.
- **Backend API** (System): Enforces reviewer authorization, validation, stale-write protection, and audit recording.
- **PostgreSQL (Prisma)** (System): Stores question records, revision metadata, and audit events.

## External Systems

| System | Direction | Data Exchanged | Protocol | Risk |
|--------|-----------|----------------|----------|------|
| Web Browser | Inbound/Outbound | CRUD requests, list/filter queries, conflict responses | HTTPS JSON | Low |
| Authentication/JWT layer | Inbound | User identity and role claims (`reviewer`) | Cookie + JWT | Medium |

## Data Flows

### Inbound
- Reviewer list/filter requests with pagination and filters.
- Reviewer create/update payloads including answer and metadata.
- Reviewer delete/archive actions with explicit confirmation.
- Update requests carrying revision token (`updatedAt` or `version`).

### Outbound
- Paginated filtered question lists and full question detail.
- Validation error payloads with field-level messages.
- Conflict responses containing latest persisted record metadata.
- Audit references or operation IDs for create/update/delete actions.

## Context Diagram

```mermaid
C4Context
    title System Context - 003-admin-question-management

    Person(reviewer, "Reviewer", "Manages question and answer quality")
    System(portal, "DevOps Teacher Portal", "Reviewer question management module")
    SystemDb(db, "PostgreSQL", "Questions, revisions, audit events")
    System_Ext(auth, "Auth/JWT", "Authenticated identity and role claims")

    Rel(reviewer, portal, "Creates/updates/archives/questions")
    Rel(portal, db, "Reads/Writes questions and audit events")
    Rel(auth, portal, "Supplies reviewer role claims")
```

## Boundary Notes

- Access is reviewer-only for both UI and API paths.
- Delete path uses soft-delete/archival as default safety posture.
- Stale writes are blocked via conflict detection (optimistic concurrency).
- All mutations must emit immutable audit events.
