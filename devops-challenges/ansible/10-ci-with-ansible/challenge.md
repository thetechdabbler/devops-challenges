# Challenge — CI with Ansible

## Scenario

Your team runs Ansible playbooks in GitHub Actions to provision infrastructure. A colleague set up the workflow, but it runs on every push (including to feature branches), doesn't lint the playbooks, uses a plaintext vault password in the env block, and doesn't test the playbook with Molecule before running it in production.

Fix the CI workflow so Ansible runs safely, with linting and testing gated by branch.

## Your Task

The file `starter/ci.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Runs on every push, not just `main`** — missing `branches: [main]` filter on push trigger
2. **Vault password in plaintext env var** — `ANSIBLE_VAULT_PASSWORD: "supersecret"` exposed in YAML
3. **`ansible-lint` not run** — no linting step before playbook execution
4. **`--check` mode not used** — playbook runs in "live" mode in CI (should use `--check` for PRs)
5. **No SSH key setup** — Ansible tries to SSH to hosts without setting up the private key first

## Acceptance Criteria

- [ ] Workflow only runs on pushes to `main`
- [ ] Vault password read from `secrets.ANSIBLE_VAULT_PASSWORD`
- [ ] `ansible-lint` runs before the playbook and fails CI on warnings
- [ ] `--check` flag used in CI (dry run, no real changes)
- [ ] SSH private key set up from `secrets.SSH_PRIVATE_KEY`

## Learning Notes

**Ansible in GitHub Actions:**
```yaml
- name: Set up SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa

- name: Write vault password
  run: echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > .vault_pass

- name: Lint playbook
  run: ansible-lint playbook.yml

- name: Run playbook (check mode)
  run: |
    ansible-playbook -i inventory.ini playbook.yml \
      --vault-password-file .vault_pass \
      --check --diff
```

**`ansible-lint` installation:**
```bash
pip install ansible-lint
# Or
pipx install ansible-lint
```
