# Solution — Handlers and Notifications

## Fixes Applied

### Fix 1: Handler name must match `notify:` exactly

```yaml
# Before
handlers:
  - name: Restart app service

tasks:
  - notify: Reload app   # no handler with this name!

# After
handlers:
  - name: Reload app

tasks:
  - notify: Reload app   # exact match
```

Ansible matches `notify:` values to handler names as exact strings (case-sensitive). A mismatch means the handler is never triggered — no error, just silence.

### Fix 2: Use `reloaded` instead of `restarted`

```yaml
# Before
state: restarted

# After
state: reloaded
```

`restarted` kills and restarts the process — causing a brief service interruption. `reloaded` sends SIGHUP (or equivalent) to reload configuration in-place, with zero downtime. Use `reloaded` for config changes.

### Fix 3 & 5: Remove `meta: flush_handlers`

```yaml
# Before
- meta: flush_handlers   # runs handlers even with no changes

# After
# (removed — handlers run at end of play automatically)
```

`flush_handlers` is only needed when subsequent tasks depend on handler output. Using it unconditionally means handlers run even on a completely unchanged run — defeating idempotency.

### Fix 4: Handler fires once (automatic deduplication)

Ansible's handler system automatically deduplicates: no matter how many tasks notify the same handler, it runs at most once per play. Both template tasks can safely notify `Reload app`.

---

## Result

- Config changes trigger exactly one reload at end of play
- No service downtime during config updates
- Running an unchanged playbook triggers zero handler executions
