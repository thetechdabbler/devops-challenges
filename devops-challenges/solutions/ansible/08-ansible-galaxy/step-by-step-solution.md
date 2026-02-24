# Solution — Ansible Galaxy

## Fixes Applied

### Fix 1: Add `roles:` wrapper

```yaml
# Before
name: geerlingguy.nginx
version: "3.2.0"

# After
roles:
  - name: geerlingguy.nginx
    version: "3.2.0"
```

`requirements.yml` must have a `roles:` key with a list of role dicts. Top-level keys are invalid.

### Fix 2: Add `https://` to GitHub URL

```yaml
# Before
src: github.com/geerlingguy/ansible-role-mysql

# After
src: https://github.com/geerlingguy/ansible-role-mysql
```

Galaxy requires a full URL including the protocol. Without it, Galaxy tries to find the role on Galaxy Hub under the name `github.com/...`, which doesn't exist.

### Fix 3: Use correct role name in playbook

```yaml
# Before
roles:
  - nginx

# After
roles:
  - geerlingguy.nginx
```

Galaxy installs the role as `geerlingguy.nginx` (namespace.rolename). Ansible can't find a role named just `nginx` unless you created an alias or symlink.

### Fix 4: Install to `./roles` with `--roles-path`

```bash
# Before (installs to ~/.ansible/roles)
ansible-galaxy install -r requirements.yml

# After
ansible-galaxy install -r requirements.yml --roles-path ./roles
```

Or set `roles_path` in `ansible.cfg` (fix 5) — then the flag is optional.

### Fix 5: Fix `roles_path` in ansible.cfg

```ini
# Before
roles_path = ./vendor/roles

# After
roles_path = ./roles
```

`./vendor/roles` doesn't exist. Ansible would fall back to `~/.ansible/roles` and the project-local roles wouldn't be found.
