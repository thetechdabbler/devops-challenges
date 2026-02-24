# Solution — Database Migrations in CD

## Fixes Applied

### Fix 1: Run migrations before app deploy

```yaml
# Before
test → deploy → migrate

# After
test → migrate → deploy
```

The new app version requires the new schema. If you deploy first, the app starts making queries against a schema that doesn't exist yet — causing 500 errors during the window between deploy and migration. Always migrate first.

### Fix 2: Add dry-run step

```yaml
- name: Dry run — preview migration SQL
  run: alembic upgrade head --sql
```

`alembic upgrade head --sql` prints the SQL that would be executed without actually running it. Review this in the pipeline log before the real apply — catching destructive operations early.

### Fix 3: Drain connections before migration

```yaml
- name: Drain existing connections
  run: sleep 10
```

Long-running queries hold row-level or table-level locks that block `ALTER TABLE` statements. A brief sleep lets in-flight requests complete. In production, pair this with a load balancer health check to stop new traffic before draining.

### Fix 4: Rollback on migration failure

```yaml
- name: Rollback on migration failure
  if: failure() && steps.apply.conclusion == 'failure'
  run: alembic downgrade -1
```

`alembic downgrade -1` reverses the last migration. This runs only if the `apply` step specifically failed (not if the drain or dry-run failed), preventing double-rollback.

### Fix 5: `migrate` must `needs: test`

```yaml
migrate:
  needs: test    # ← don't migrate if tests fail
```

If tests fail, the migration script itself might be broken. Never apply database changes from a codebase that hasn't passed its test suite.

---

## Result

- Schema is updated before the new app version handles traffic
- Migration SQL is previewed before apply
- Active connections drain before potentially-locking schema changes
- Failed migrations auto-rollback to the previous revision
- Broken test suites can never trigger migrations
