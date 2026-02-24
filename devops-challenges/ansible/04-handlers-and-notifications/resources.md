# Resources — Handlers and Notifications

## Handler Execution Order

1. All tasks in the play run
2. Handlers fire (in definition order, not notification order)
3. Each handler runs at most once per play

## `meta: flush_handlers` Use Cases

```yaml
tasks:
  - name: Deploy config
    template: ...
    notify: Restart DB

  - meta: flush_handlers    # Run handlers NOW (before next task)

  - name: Run DB migration   # Needs DB to be restarted first
    ...
```

## Service States

| State | Effect |
|-------|--------|
| `started` | Start if not running |
| `stopped` | Stop if running |
| `restarted` | Always restart (brief downtime) |
| `reloaded` | Reload config in-place (no downtime, if supported) |

## Handler `listen:` Topics

```yaml
handlers:
  - name: Reload nginx
    listen: "web config changed"
    ansible.builtin.service:
      name: nginx
      state: reloaded

  - name: Test nginx config
    listen: "web config changed"
    ansible.builtin.command: nginx -t

tasks:
  - notify: "web config changed"  # triggers both handlers
```

## Official Docs

- [Handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html)
- [meta module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/meta_module.html)
