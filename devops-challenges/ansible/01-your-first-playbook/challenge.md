# Challenge — Your First Playbook

## Scenario

You've been handed an Ansible playbook that's supposed to install and start nginx on a group of web servers. When you run it, it fails immediately with YAML errors and then Ansible connection errors even after fixing those.

Debug and fix the playbook to successfully install nginx on all hosts in the `webservers` group.

## Your Task

The file `starter/playbook.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong YAML start** — playbook list starts with `---` on line 2, but there's a stray character before it
2. **Wrong `hosts` key** — `host:` (singular) is not valid, should be `hosts:`
3. **`become: yes` misspelled** — privilege escalation key has a typo
4. **Wrong module name** — `apt_package` is not a valid Ansible module
5. **Service not started** — the play installs nginx but never starts it (missing service task)

## Acceptance Criteria

- [ ] `ansible-playbook -i inventory.ini playbook.yml --check` passes with no errors
- [ ] Running without `--check` installs nginx and starts the service
- [ ] `ansible webservers -i inventory.ini -m shell -a "systemctl status nginx"` shows `active (running)`
- [ ] Playbook is idempotent — running it twice doesn't report changes on the second run

## Learning Notes

**Playbook anatomy:**
```yaml
---
- name: Describe the play
  hosts: webservers        # target group from inventory
  become: true             # sudo / privilege escalation

  tasks:
    - name: Install nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Start nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

**Key commands:**
```bash
# Dry run
ansible-playbook -i inventory.ini playbook.yml --check

# Run with verbose output
ansible-playbook -i inventory.ini playbook.yml -v

# Syntax check only
ansible-playbook playbook.yml --syntax-check

# List hosts that will be targeted
ansible-playbook -i inventory.ini playbook.yml --list-hosts
```
