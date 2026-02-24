# Solution — Ansible Vault

## Fixes Applied

### Fix 1: Move secret out of plaintext vars

Remove `db_password` from `vars/main.yml` and put it only in the encrypted `vars/vault.yml`.

```yaml
# vars/main.yml — non-secret only
db_user: appuser
db_host: db.internal
db_name: appdb

# vars/vault.yml — encrypted with ansible-vault
db_password: supersecret123
```

### Fix 2: Use correct variable name

```yaml
# Before
{{ db_pass }}

# After
{{ db_password }}   # matches what's defined in vault.yml
```

### Fix 3: Remove `debug: var=db_password`

```yaml
# Before
- ansible.builtin.debug:
    var: db_password   # prints secret to stdout/logs!

# After
- ansible.builtin.debug:
    msg: "Connecting as {{ db_user }} to {{ db_host }}/{{ db_name }}"
```

Also add `no_log: true` to any task whose command-line contains the secret:
```yaml
- ansible.builtin.command: /opt/myapp/bin/start --db-pass {{ db_password }}
  no_log: true
```

### Fix 4: Correct `vars_files` filename

```yaml
# Before
- vars/secrets.yml

# After
- vars/vault.yml
```

### Fix 5: Valid vault file format

The vault file must be valid YAML (a mapping), not a bare string.

```yaml
# Before (invalid)
supersecret123

# After (valid YAML, then encrypt with ansible-vault)
---
db_password: supersecret123
```

Encrypt: `ansible-vault encrypt vars/vault.yml`

---

## Result

- Secrets never appear in plaintext in version-controlled files
- `db_password` is available to tasks without printing it
- Running with wrong vault password produces a decryption error
