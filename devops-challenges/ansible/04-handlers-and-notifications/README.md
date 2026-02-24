# Exercise 04 — Handlers and Notifications

Fix a playbook's handler setup so config changes trigger exactly one reload (not restart) at the right time.

## Quick Start

```bash
ansible-playbook -i starter/inventory.ini starter/playbook.yml --check --diff
```

## Files

- `starter/playbook.yml` — broken handler usage (5 bugs)
- `solutions/playbook.yml` — fixed playbook
- `solutions/step-by-step-solution.md` — explanation of each fix
