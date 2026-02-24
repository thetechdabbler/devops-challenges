# Challenge — Handlers and Notifications

## Scenario

Your playbook deploys an app config and restarts the application service when it changes. But you've noticed handlers fire even when no changes were made, the app service is restarted instead of reloaded, and two separate template tasks both notify the same handler causing double restarts.

Fix the playbook so handlers are efficient, correct, and fire only once.

## Your Task

The file `starter/playbook.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Handler name mismatch** — task notifies `Reload app` but handler is named `Restart app service`
2. **Handler uses `restarted` instead of `reloaded`** — config changes should reload, not restart (causes downtime)
3. **Force handler execution without changes** — `meta: flush_handlers` is called unconditionally
4. **Duplicate notifications** — two tasks notify the same handler but `listen:` isn't used to deduplicate
5. **Handler runs before all tasks complete** — `flush_handlers` called mid-play incorrectly

## Acceptance Criteria

- [ ] Handler only fires when at least one notifying task reports a change
- [ ] Config changes trigger a reload (no downtime), not a restart
- [ ] Handler fires exactly once even when multiple tasks notify it
- [ ] Handler name matches the `notify:` value exactly
- [ ] `meta: flush_handlers` is removed (handlers run at end of play naturally)

## Learning Notes

**Handler basics:**
```yaml
handlers:
  - name: Reload app
    ansible.builtin.service:
      name: myapp
      state: reloaded

tasks:
  - name: Deploy config
    ansible.builtin.template:
      src: config.j2
      dest: /etc/myapp/config.conf
    notify: Reload app
```

**Handler deduplication with `listen:`:**
```yaml
handlers:
  - name: Reload app
    listen: "app config changed"
    ansible.builtin.service:
      name: myapp
      state: reloaded

tasks:
  - notify: "app config changed"  # multiple tasks can use same topic
```

**Handler execution:**
- Handlers run once at the end of a play, regardless of how many tasks notified them
- `meta: flush_handlers` runs pending handlers immediately at that point in the play
- Only use `flush_handlers` when you need handlers to run before subsequent tasks depend on them
