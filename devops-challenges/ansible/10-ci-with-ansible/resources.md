# Resources — CI with Ansible

## ansible-lint

```bash
# Install
pip install ansible-lint

# Run against playbook
ansible-lint playbook.yml

# Run against role
ansible-lint roles/webserver/

# Specific rule checks
ansible-lint --list-rules

# Exit codes
# 0 = no issues
# 1 = issues found
# 2 = invalid arguments
```

## SSH Key Setup in GitHub Actions

```yaml
- name: Set up SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan -H ${{ vars.BASTION_HOST }} >> ~/.ssh/known_hosts
```

Or use the `webfactory/ssh-agent` action:
```yaml
- uses: webfactory/ssh-agent@v0.8.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

## Vault Password in CI

```yaml
- name: Write vault password file
  run: echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > .vault_pass

- name: Run playbook
  run: |
    ansible-playbook playbook.yml \
      --vault-password-file .vault_pass \
      --check --diff

- name: Clean up vault password
  if: always()
  run: rm -f .vault_pass
```

## Official Docs

- [ansible-lint](https://ansible.readthedocs.io/projects/lint/)
- [Ansible in CI](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html)
- [Molecule testing](https://ansible.readthedocs.io/projects/molecule/)
