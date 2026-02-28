# Integration Test Instructions

## Status: DEFERRED — Applicable from Unit 3 onward

Integration tests require at least two units to be complete so that real service interactions can be tested end-to-end. Unit 1 (setup) establishes the infrastructure foundation; integration tests will be authored progressively as later units are constructed.

## Planned Integration Test Scenarios

| Scenario | Units Involved | Earliest Applicable |
|----------|---------------|---------------------|
| GitHub OAuth callback → JWT cookie set | Unit 1 + Unit 2 (auth) | After Unit 2 |
| Authenticated request → content listing | Unit 2 + Unit 3 (content-api) | After Unit 3 |
| Exercise start → progress recorded | Unit 2 + Unit 4 (progress) | After Unit 4 |
| Note auto-save → persist + retrieve | Unit 2 + Unit 5 (notes) | After Unit 5 |
| Full login → browse → start → note flow | Units 1–6 | After Unit 6 |

## Integration Test Environment

Once applicable, tests will run against a local Docker Compose stack:

```bash
# Start services
cd portal
docker compose up -d postgres

# Apply migrations
cd backend
npx prisma migrate deploy

# Run integration tests (test:integration script added in Unit 2+)
npm run test:integration
```

## Reference

This document will be updated in-place when integration tests are authored in later units.
