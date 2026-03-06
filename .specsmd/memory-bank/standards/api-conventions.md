# API Conventions

## Overview
RESTful API following JSend response format, versioned via URL prefix, with cursor-based pagination.

## API Style
REST

Resource-based routing with standard HTTP methods (GET, POST, PUT, PATCH, DELETE) and HTTP status codes. Routes live under `app/api/v1/` using Next.js App Router route handlers.

Resource naming:
- Plural nouns for collections: `/api/v1/users`, `/api/v1/exercises`
- Nested resources for relationships: `/api/v1/users/:id/progress`
- kebab-case for multi-word resources: `/api/v1/exercise-attempts`

## API Versioning
URL prefix: `/api/v1/`

All API routes prefixed with version. Breaking changes increment the version (`/api/v2/`). Old versions deprecated with a sunset header before removal.

## Response Format
JSend specification:

**Success** (2xx):
```json
{
  "status": "success",
  "data": { ... }
}
```

**Fail** (4xx — client error, validation failure):
```json
{
  "status": "fail",
  "data": {
    "email": "Email is required",
    "password": "Must be at least 8 characters"
  }
}
```

**Error** (5xx — server error):
```json
{
  "status": "error",
  "message": "An unexpected error occurred"
}
```

## Error Response Format
Full JSend — all three status types used:
- `success` for all successful responses
- `fail` for validation errors and client mistakes (400, 422)
- `error` for server-side failures (500)

Never expose internal error details (stack traces, DB errors) in production responses.

## Pagination Strategy
Cursor-based pagination:

Request:
```
GET /api/v1/exercises?cursor=<opaque_cursor>&limit=20
```

Response:
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "nextCursor": "<opaque_cursor>",
    "hasMore": true
  }
}
```

- `cursor` is opaque (base64-encoded ID or timestamp)
- Default `limit`: 20, max: 100
- `nextCursor` is `null` when no more results
