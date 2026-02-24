# Challenge — Ansible Galaxy

## Scenario

Your team uses Ansible Galaxy roles to avoid reinventing the wheel. A colleague set up `requirements.yml` to install the `geerlingguy.nginx` and `geerlingguy.mysql` roles, but the file has syntax errors, the roles aren't in the correct path, and the playbook uses the wrong role name.

Fix the `requirements.yml` and playbook so Galaxy roles install correctly.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`requirements.yml` has wrong format** — `name:` and `version:` are top-level keys, not under a `roles:` list
2. **Role source URL missing `https://`** — GitHub URLs must be complete
3. **Wrong role name in playbook** — role is referenced as `nginx` but Galaxy installs it as `geerlingguy.nginx`
4. **`ansible-galaxy install` command missing `--roles-path`** — roles install to home dir by default, not project `roles/`
5. **`roles_path` in `ansible.cfg` pointing to wrong directory** — `./vendor/roles` doesn't exist, should be `./roles`

## Acceptance Criteria

- [ ] `ansible-galaxy install -r requirements.yml` succeeds
- [ ] Roles are installed to `./roles/` directory
- [ ] `ansible-playbook site.yml --list-tasks` shows role tasks
- [ ] `ansible.cfg` correctly sets `roles_path = ./roles`
- [ ] `requirements.yml` validates against Galaxy format

## Learning Notes

**requirements.yml format:**
```yaml
roles:
  - name: geerlingguy.nginx
    version: "3.2.0"

  - src: https://github.com/geerlingguy/ansible-role-nginx
    name: nginx
    version: master

collections:
  - name: community.general
    version: ">=5.0.0"
```

**Install commands:**
```bash
# Install roles from requirements
ansible-galaxy install -r requirements.yml --roles-path ./roles

# Install single role
ansible-galaxy role install geerlingguy.nginx --roles-path ./roles

# List installed roles
ansible-galaxy role list
```
