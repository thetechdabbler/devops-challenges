# Exercise 05 — Ansible Vault

Fix a playbook that leaks secrets in plaintext — encrypt with Vault and use them safely.

## Quick Start

```bash
# Create vault password file (never commit this)
echo "myVaultPassword" > .vault_pass
chmod 600 .vault_pass

# Encrypt the secrets file
ansible-vault encrypt starter/vars/vault.yml --vault-password-file .vault_pass

# Run playbook
ansible-playbook -i starter/inventory.ini starter/playbook.yml \
  --vault-password-file .vault_pass --check
```

## Files

- `starter/playbook.yml` — broken playbook (3 bugs)
- `starter/vars/main.yml` — unencrypted vars
- `starter/vars/vault.yml` — should be encrypted (2 bugs)
- `solutions/playbook.yml` — fixed playbook
- `solutions/step-by-step-solution.md` — explanation
