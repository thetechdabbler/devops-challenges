# Resources — Ansible Vault

## Vault Commands

```bash
# Create new encrypted file
ansible-vault create secrets.yml

# Encrypt existing file
ansible-vault encrypt secrets.yml

# View (decrypt to stdout)
ansible-vault view secrets.yml

# Edit in place
ansible-vault edit secrets.yml

# Decrypt in place (use carefully)
ansible-vault decrypt secrets.yml

# Re-key (change password)
ansible-vault rekey secrets.yml

# Encrypt a single string
ansible-vault encrypt_string 'mysecret' --name 'db_password'
```

## Vault Password Sources

```bash
# Password file
ansible-playbook playbook.yml --vault-password-file .vault_pass

# Interactive prompt
ansible-playbook playbook.yml --ask-vault-pass

# Environment variable (via script)
ANSIBLE_VAULT_PASSWORD_FILE=~/.vault_pass ansible-playbook playbook.yml
```

## Inline Vault (encrypt_string)

```yaml
# vars/main.yml — mix of plain and encrypted
db_user: appuser
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  34643432383834...
```

Generated with:
```bash
ansible-vault encrypt_string 'mysecret' --name 'db_password'
```

## .gitignore for Vault Files

```gitignore
.vault_pass
*.vault_pass
# Don't ignore vault.yml — it should be committed (encrypted)
```

## Official Docs

- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html)
- [Best practices for variables](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html#tip-for-variables-and-vaults)
