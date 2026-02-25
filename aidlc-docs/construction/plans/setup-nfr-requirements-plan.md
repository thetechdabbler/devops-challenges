# NFR Requirements Plan — Unit 1: setup

## Unit Context

Unit 1 (setup) establishes the application skeleton, database schema, Docker Compose config, and startup/error behaviours. Its NFRs govern the operational qualities of the entire backend: logging, security posture, reliability, and deployment.

Most NFRs for this application are already defined in `portal-requirements.md` (NFR-01 through NFR-05). This plan identifies the remaining decisions not yet resolved.

---

## Questions

---

### Q1: Server-Side Logging Approach

How should the backend emit logs in production?

A) **Plain `console.log`** — simple stdout/stderr, readable in Docker logs, zero extra dependency

B) **Structured JSON logging via `pino`** — each log line is a JSON object (`{ level, time, msg, ... }`), machine-parseable, compatible with log aggregators (Loki, Datadog, etc.)

C) **Winston** — flexible multi-transport logger, more configuration overhead than pino

[Answer]: B

---

### Q2: Rate Limiting on Auth Endpoints

GitHub OAuth callback endpoints (`GET /auth/github`, `GET /auth/github/callback`) and the logout endpoint are unauthenticated. Should any rate limiting be applied?

A) **No rate limiting** — personal single-user tool, not worth the complexity

B) **Basic rate limiting on auth routes only** — e.g., 20 requests per minute per IP using `express-rate-limit` (prevents brute-force on the OAuth initiation endpoint)

C) **Rate limiting on all routes** — apply a global rate limiter to every endpoint

[Answer]: A

---

### Q3: Expected Concurrent Users

The portal is a personal learning tool. What is the expected number of simultaneous users?

A) **1 user** — personal tool, only you will use it

B) **2–5 users** — small team or study group sharing the same instance

C) **More than 5** — wider access, needs more consideration for connection pool sizing

[Answer]: B

---

## Artifact Generation Steps

- [x] Create `aidlc-docs/construction/setup/nfr-requirements/nfr-requirements.md`
  - Scalability, performance, availability, security, reliability, maintainability requirements
  - Specific targets and constraints per category
- [x] Create `aidlc-docs/construction/setup/nfr-requirements/tech-stack-decisions.md`
  - Logging library decision and rationale
  - Rate limiting decision and rationale
  - Connection pool sizing based on user count
  - All other resolved tech stack decisions for Unit 1
