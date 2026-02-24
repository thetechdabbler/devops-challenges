# Exercise 03 — Roles and Reusability

Fix an Ansible role structure and site playbook so the webserver role is properly encapsulated and reusable.

## Quick Start

```bash
# From the starter/ directory
ansible-playbook -i inventory.ini site.yml --syntax-check
ansible-playbook -i inventory.ini site.yml --check --diff
```

## Files

```
starter/
  site.yml               — site playbook (bug: role not called)
  inventory.ini
  roles/webserver/
    tasks/main.yml       — role tasks (2 bugs)
    handlers/main.yml    — handlers (1 bug: empty)
    templates/           — Jinja2 templates (1 bug: variable hardcoded)
    defaults/main.yml    — default vars
solutions/
  site.yml
  roles/webserver/...    — fixed role
```
