# Exercise 01 — Your First Playbook

Debug and fix a broken Ansible playbook that installs and starts nginx on web servers.

## Quick Start

```bash
# Syntax check
ansible-playbook starter/playbook.yml --syntax-check

# Dry run against local inventory
ansible-playbook -i starter/inventory.ini starter/playbook.yml --check

# Apply
ansible-playbook -i starter/inventory.ini starter/playbook.yml
```

## Files

- `starter/playbook.yml` — broken playbook (5 bugs)
- `starter/inventory.ini` — sample inventory
- `solutions/playbook.yml` — fixed playbook
- `solutions/step-by-step-solution.md` — explanation of each fix
