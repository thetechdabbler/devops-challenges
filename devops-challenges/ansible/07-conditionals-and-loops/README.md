# Exercise 07 — Conditionals and Loops

Fix a playbook's `when:` conditions and `loop:` tasks so they work correctly across Linux distributions.

## Quick Start

```bash
# Check which facts are available
ansible webservers -i inventory.ini -m setup -a "filter=ansible_distribution*"

# Run with check mode
ansible-playbook -i starter/inventory.ini starter/playbook.yml --check
```

## Files

- `starter/playbook.yml` — broken playbook (5 bugs)
- `solutions/playbook.yml` — fixed playbook
- `solutions/step-by-step-solution.md` — explanation of each fix
