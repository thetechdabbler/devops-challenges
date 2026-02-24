# Solution — CI with Ansible

## Fixes Applied

### Fix 1: Add branch filter to push trigger

```yaml
# Before
on:
  push:

# After
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Without a branch filter, every feature branch push triggers the full Ansible CI — wasting runner minutes and potentially causing conflicts. Restrict to `main` for production runs.

### Fix 2: Use secret for vault password

```yaml
# Before
env:
  ANSIBLE_VAULT_PASSWORD: "supersecret"

# After
- name: Write vault password
  run: echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > .vault_pass
```

Plaintext passwords in env blocks appear in workflow YAML (checked into Git) and in job logs. GitHub Secrets mask the value in logs and are not accessible outside the repository.

### Fix 3: Add `ansible-lint` step

```yaml
- name: Lint playbook
  run: ansible-lint playbook.yml
```

`ansible-lint` catches deprecated syntax, best-practice violations, and idempotency issues before the playbook runs. It returns exit code 1 on findings, failing the CI job.

### Fix 4: Add `--check` and `--diff`

```yaml
# Before
ansible-playbook -i inventory.ini playbook.yml

# After
ansible-playbook -i inventory.ini playbook.yml --check --diff
```

`--check` runs in dry-run mode (no real changes). `--diff` shows file content changes that would be made. Together they give a preview of changes without touching production.

### Fix 5: Set up SSH key

```yaml
- name: Set up SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
```

Ansible needs SSH access to managed hosts. The GitHub Actions runner doesn't have any SSH keys by default — they must be injected from secrets.

---

## Result

- CI runs on `main` pushes and PRs
- Vault password never appears in workflow YAML or logs
- `ansible-lint` catches issues before execution
- `--check --diff` previews changes safely
- Ansible can SSH to managed hosts via the injected key
