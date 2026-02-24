# Exercise 02 — Variables and Templates

Fix a playbook that renders an nginx config with Jinja2 templates and Ansible variables.

## Quick Start

```bash
# Validate template syntax
ansible-playbook -i starter/inventory.ini starter/playbook.yml --syntax-check

# Dry run showing file diffs
ansible-playbook -i starter/inventory.ini starter/playbook.yml --check --diff
```

## Files

- `starter/playbook.yml` — broken playbook (5 bugs)
- `starter/templates/nginx.conf.j2` — Jinja2 nginx config template
- `solutions/playbook.yml` — fixed playbook
- `solutions/templates/nginx.conf.j2` — fixed template
- `solutions/step-by-step-solution.md` — explanation of each fix
