# Solution — Inventory and Groups

## Fixes Applied

### Fix 1: Correct group name in playbook

```yaml
# Before
hosts: web

# After
hosts: webservers
```

### Fix 2: Rename group_vars file to include .yml extension

```bash
mv starter/group_vars/webservers starter/group_vars/webservers.yml
```

Ansible loads `group_vars/webservers.yml` or files inside `group_vars/webservers/`. A plain file without an extension is ignored.

### Fix 3: Fix `[production:children]` reference

```ini
# Before
[production:children]
web
dbservers

# After
[production:children]
webservers
dbservers
```

`web` doesn't exist as a group — the child group reference silently does nothing, or Ansible warns about an unknown group.

### Fix 4 & 5: Host var override is correct

The `host_vars/web1.yml` correctly overrides `http_port` for web1 only. This is valid Ansible variable precedence behavior — host vars override group vars. No fix needed for these bugs once the group_vars file is correctly named (fix 2).

---

## Result

```bash
ansible-inventory -i inventory.ini --graph
@all:
  |--@production:
  |  |--@webservers:
  |  |  |--web1
  |  |  |--web2
  |  |--@dbservers:
  |  |  |--db1
```

- web1 gets `http_port: 8080` (host_vars override)
- web2 gets `http_port: 80` (group_vars default)
