# Challenge — Conditionals and Loops

## Scenario

Your playbook provisions users, installs packages, and configures services based on the target OS. But when you run it on Ubuntu, it skips tasks that should run, loops fail with YAML errors, and a conditional check for the OS distribution is always True even on non-Ubuntu systems.

Fix the playbook so conditionals and loops work correctly across different Linux distributions.

## Your Task

The file `starter/playbook.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`when:` condition always true** — `when: ansible_os_family == "ubuntu"` should be `ansible_os_family == "Debian"` (case-sensitive) or `ansible_distribution == "Ubuntu"`
2. **`loop:` item reference wrong** — task uses `{{ item.name }}` but loop list has plain strings, not dicts
3. **`with_items` and `loop` mixed** — using deprecated `with_items:` in one task and `loop:` in another (pick one — use `loop:`)
4. **`failed_when` always fails** — `failed_when: result.rc != 0` but the preceding command always returns a non-zero exit for a different reason (logic error)
5. **`register` variable not checked** — `register: result` used but `result.stdout` is referenced without checking `result.rc` first

## Acceptance Criteria

- [ ] Ubuntu hosts install nginx via `apt` (when `ansible_distribution == "Ubuntu"`)
- [ ] CentOS hosts install nginx via `yum` (when `ansible_distribution == "CentOS"`)
- [ ] User creation loop runs once per user in the `users` list
- [ ] `failed_when` condition is logically correct
- [ ] Registered command output is only used when command succeeded

## Learning Notes

**Conditionals:**
```yaml
- name: Install on Debian-based
  ansible.builtin.apt:
    name: nginx
  when: ansible_os_family == "Debian"   # capital D

- name: Install on RedHat-based
  ansible.builtin.yum:
    name: nginx
  when: ansible_os_family == "RedHat"   # capital R
```

**Loops:**
```yaml
# Simple list
- ansible.builtin.user:
    name: "{{ item }}"
  loop:
    - alice
    - bob

# List of dicts
- ansible.builtin.user:
    name: "{{ item.name }}"
    shell: "{{ item.shell }}"
  loop:
    - { name: alice, shell: /bin/bash }
    - { name: bob, shell: /bin/sh }
```
