# NFR Design Plan — Unit 1: setup

## Assessment

All NFR design decisions are fully determined by the Functional Design (business-logic-model.md, business-rules.md) and NFR Requirements (nfr-requirements.md, tech-stack-decisions.md). No clarifying questions required.

## Patterns to Apply

| Pattern | NFR Driver |
|---------|-----------|
| Retry Pattern | DB connection retry on startup (BR-03) |
| Fail-Fast Pattern | Env var validation at startup (BR-04) |
| Singleton Pattern | PrismaClient and pino logger shared instances |
| Structured Logging Pattern | pino JSON output with log level control |
| Health Check Pattern | Readiness check with DB ping (BR-01) |
| Error Envelope Pattern | Consistent error shape across all routes (BR-02) |
| Graceful Shutdown Pattern | SIGTERM/SIGINT handler with connection drain |
| Middleware Chain Pattern | Ordered Express middleware registration |

## Artifact Generation Steps

- [x] Create `aidlc-docs/construction/setup/nfr-design/nfr-design-patterns.md`
  - Pattern descriptions, rationale, and implementation guidance per NFR
- [x] Create `aidlc-docs/construction/setup/nfr-design/logical-components.md`
  - Logical component definitions that implement the patterns
  - Interfaces, responsibilities, and interactions
