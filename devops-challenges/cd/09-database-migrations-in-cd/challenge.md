# Challenge — Database Migrations in CD

## Scenario

Your Flask app uses SQLAlchemy with Alembic for database migrations. The CD pipeline deploys the new app version, then runs migrations — but this ordering is backwards (new app goes live before the schema it needs exists), and there are no dry-runs, no rollback scripts, and no connection drain.

Fix the CD pipeline so database migrations are safe, ordered, and reversible.

## Your Task

The file `starter/cd.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Migration runs after app deploy** — backward incompatible: new app is live before the schema exists
2. **No dry-run step** — `alembic upgrade head` applies immediately with no preview
3. **No connection pool drain** — active connections hold locks, causing migration failures
4. **Missing rollback migration script** — no `downgrade` step if migration fails
5. **Migration job missing `needs: test`** — migrations can run against a broken schema

## Acceptance Criteria

- [ ] Migrations run before the new app version goes live
- [ ] A dry-run (`--sql`) previews the migration SQL before applying
- [ ] Existing DB connections are drained with a brief sleep before migration
- [ ] A `downgrade` step runs automatically if migration fails
- [ ] Migrations only run after tests pass

## Learning Notes

**Safe migration order:**
```
1. Run tests
2. Apply DB migration (backward-compatible schema change)
3. Deploy new app version
4. (Optional) Apply non-backward-compatible cleanup
```

**Alembic commands:**
```bash
# Preview SQL without applying
alembic upgrade head --sql

# Apply migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1

# Roll back to specific revision
alembic downgrade <revision>

# Show current revision
alembic current
```

**Zero-downtime migration rule:**
Schema changes must be backward-compatible with the currently-running app version. Add columns as nullable; remove columns only after the old app version is retired.
