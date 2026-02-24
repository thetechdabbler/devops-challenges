# Exercise 10 — CI with Ansible

Fix a GitHub Actions workflow that runs Ansible playbooks in CI with linting, vault, and SSH key setup.

## Quick Start

```bash
# Set required GitHub secrets:
# SSH_PRIVATE_KEY — private key for SSH to managed hosts
# ANSIBLE_VAULT_PASSWORD — password for vault-encrypted files

# Push to main to trigger workflow
git push origin main
```

## Files

- `starter/ci.yml` — broken CI workflow (5 bugs)
- `solutions/ci.yml` — fixed workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
