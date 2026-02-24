# Exercise 06 — Inventory and Groups

Fix an Ansible inventory, group_vars, and playbook so each server type receives correct configuration.

## Quick Start

```bash
# Validate inventory
ansible-inventory -i starter/inventory.ini --list
ansible-inventory -i starter/inventory.ini --graph

# Check what a specific host resolves to
ansible-inventory -i starter/inventory.ini --host web1
```

## Files

- `starter/inventory.ini` — broken inventory (3 bugs)
- `starter/group_vars/` — group variable files (1 bug)
- `starter/playbook.yml` — broken playbook (1 bug)
- `solutions/` — fixed versions
