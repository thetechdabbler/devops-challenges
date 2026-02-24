# Exercise 09 — Database Migrations in CD

Fix a CD pipeline so database migrations run safely before the app deploy, with dry-runs, rollbacks, and connection draining.

## Quick Start

```bash
# Preview migration SQL
alembic upgrade head --sql

# Apply migration
alembic upgrade head

# Verify current revision
alembic current

# Roll back
alembic downgrade -1
```

## Files

- `starter/cd.yml` — broken migration workflow (5 bugs)
- `solutions/cd.yml` — working workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
