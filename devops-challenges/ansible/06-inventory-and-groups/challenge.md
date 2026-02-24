# Challenge — Inventory and Groups

## Scenario

Your infrastructure has web servers, database servers, and a load balancer. The Ansible inventory groups them, but the playbook targets the wrong groups, group variables have syntax errors, and host-specific variables shadow group variables incorrectly.

Fix the inventory and playbook so each server type receives the right configuration.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong group name in playbook** — playbook targets `web` but inventory defines `webservers`
2. **`group_vars` directory structure wrong** — `group_vars/webservers` is a file, not a directory (must be `group_vars/webservers.yml` or `group_vars/webservers/main.yml`)
3. **Child group syntax error** — `[production:children]` references `web` (which doesn't exist) instead of `webservers`
4. **Host variable overrides wrong value** — `web1` sets `http_port=8080` but the group default is already 80; the intent was to override only for web1
5. **`all:vars` block sets `ansible_user` but hosts already define it** — creates confusing precedence (host vars win, but the intent isn't clear)

## Acceptance Criteria

- [ ] `ansible-inventory -i inventory.ini --list` shows correct groups
- [ ] `webservers` group gets `http_port: 80` from group_vars
- [ ] `web1` gets `http_port: 8080` from host_vars (override)
- [ ] `production` group correctly includes all child groups
- [ ] Playbook targets `webservers` successfully

## Learning Notes

**Inventory group hierarchy:**
```ini
[webservers]
web1
web2

[dbservers]
db1

[production:children]
webservers
dbservers
```

**group_vars/ and host_vars/ layout:**
```
group_vars/
  all.yml             # vars for all hosts
  webservers.yml      # vars for webservers group
  webservers/
    main.yml          # same effect, allows splitting
host_vars/
  web1.yml            # vars for web1 only
```

**Variable precedence (low → high):**
```
group_vars/all → group_vars/group → host_vars/host → extra_vars
```
