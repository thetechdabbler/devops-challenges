# Resources — Database Migrations in CD

## Alembic Commands

```bash
# Initialize (creates alembic.ini + migrations/)
alembic init migrations

# Generate migration from model changes
alembic revision --autogenerate -m "add users table"

# Preview SQL (dry run)
alembic upgrade head --sql

# Apply
alembic upgrade head

# Roll back one revision
alembic downgrade -1

# Roll back to specific revision
alembic downgrade abc123

# Show history
alembic history --verbose

# Show current revision
alembic current
```

## Safe Migration Order in CD

```
test → migrate (dry-run + apply) → deploy app
```

```yaml
jobs:
  test:
    ...

  migrate:
    needs: test
    steps:
      - name: Drain connections
        run: sleep 5   # simple; use pg_terminate_backend for production

      - name: Dry run
        run: alembic upgrade head --sql | tee migration-preview.sql

      - name: Apply migration
        run: alembic upgrade head

      - name: Rollback on failure
        if: failure()
        run: alembic downgrade -1

  deploy:
    needs: migrate
    ...
```

## Connection Drain (PostgreSQL)

```sql
-- Terminate all connections to app database
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'myapp' AND pid <> pg_backend_pid();
```

## Official Docs

- [Alembic tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [alembic upgrade/downgrade](https://alembic.sqlalchemy.org/en/latest/ops.html)
- [Zero-downtime migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)
