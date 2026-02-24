# Exercise 09 — Dynamic Inventory

Fix an AWS EC2 dynamic inventory plugin config so Ansible auto-discovers production instances.

## Quick Start

```bash
# Install AWS collection
ansible-galaxy collection install amazon.aws

# Test dynamic inventory
ansible-inventory -i starter/aws_ec2.yml --list
ansible-inventory -i starter/aws_ec2.yml --graph

# Ping discovered hosts
ansible all -i starter/aws_ec2.yml -m ping
```

## Files

- `starter/aws_ec2.yml` — broken dynamic inventory config (4 bugs)
- `starter/ansible.cfg` — missing plugin enablement (1 bug)
- `solutions/aws_ec2.yml` — fixed config
- `solutions/ansible.cfg` — fixed config
- `solutions/step-by-step-solution.md` — explanation
