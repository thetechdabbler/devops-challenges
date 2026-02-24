# Exercise 08 — Ansible Galaxy

Fix requirements.yml, ansible.cfg, and a site playbook to correctly install and use Galaxy roles.

## Quick Start

```bash
# Install Galaxy roles
ansible-galaxy install -r starter/requirements.yml --roles-path ./roles

# Verify installation
ansible-galaxy role list

# Run playbook
ansible-playbook -i starter/inventory.ini starter/site.yml --check
```

## Files

- `starter/requirements.yml` — broken Galaxy requirements (2 bugs)
- `starter/ansible.cfg` — broken config (1 bug)
- `starter/site.yml` — broken playbook (1 bug)
- `solutions/` — fixed versions
