# Challenge — Ansible Vault

## Scenario

Your team stores database passwords and API keys in Ansible playbooks — in plaintext. Security has flagged this as a critical issue. You need to encrypt the secrets with Ansible Vault and fix the playbook to use them correctly.

A colleague made a first attempt at adding vault encryption, but the vault file is referenced wrong, the password is still visible in a debug task, and the `--vault-password-file` argument is missing from the playbook run docs.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Secret in plaintext in `vars/main.yml`** — `db_password: supersecret` not encrypted
2. **Vault file referenced with wrong variable name** — playbook uses `{{ db_pass }}` but vault defines `db_password`
3. **Debug task prints the secret** — `debug: var=db_password` outputs the vault value to logs
4. **`vars_files` points to wrong path** — references `secrets.yml` but file is named `vault.yml`
5. **Vault file uses single-key format incorrectly** — vault file should be a YAML mapping, not a bare string

## Acceptance Criteria

- [ ] `ansible-vault view vault.yml` shows the encrypted secret
- [ ] Playbook runs with `--vault-password-file .vault_pass`
- [ ] `db_password` is accessible to tasks but never printed in output
- [ ] `vars_files` references the correct vault filename
- [ ] Re-running the playbook with wrong vault password fails gracefully

## Learning Notes

**Create an encrypted file:**
```bash
ansible-vault create vault.yml
ansible-vault encrypt existing_vars.yml
```

**Decrypt / view:**
```bash
ansible-vault view vault.yml
ansible-vault decrypt vault.yml   # decrypt in place (careful!)
ansible-vault edit vault.yml
```

**Use in playbook:**
```yaml
vars_files:
  - vars/main.yml
  - vars/vault.yml    # encrypted vars merged in

# Run with:
ansible-playbook playbook.yml --vault-password-file .vault_pass
# Or prompt:
ansible-playbook playbook.yml --ask-vault-pass
```

**Avoid printing secrets:**
```yaml
- name: Show non-secret info only
  ansible.builtin.debug:
    msg: "DB user: {{ db_user }}"
  # never debug: var=db_password
```
