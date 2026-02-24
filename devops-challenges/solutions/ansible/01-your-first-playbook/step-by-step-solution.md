# Solution — Your First Playbook

## Fixes Applied

### Fix 1: YAML document start

```yaml
# Before
!---

# After
---
```

`---` marks the start of a YAML document. A leading `!` makes the document invalid YAML — `ansible-playbook --syntax-check` catches this immediately.

### Fix 2: `host` → `hosts`

```yaml
# Before
host: webservers

# After
hosts: webservers
```

Ansible requires `hosts:` (plural). `host:` is silently ignored, causing Ansible to run against no targets.

### Fix 3: `becom` → `become`

```yaml
# Before
becom: true

# After
become: true
```

`become: true` enables privilege escalation (sudo). A typo silently disables it — the `apt` task would then fail with "permission denied".

### Fix 4: `apt_package` → `apt`

```yaml
# Before
ansible.builtin.apt_package:

# After
ansible.builtin.apt:
```

The correct module is `ansible.builtin.apt` (or just `apt`). `apt_package` doesn't exist and raises `ERROR! couldn't resolve module/action 'ansible.builtin.apt_package'`.

### Fix 5: Add service task

```yaml
- name: Start and enable nginx
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

Installing a package doesn't start it. The `service` module with `state: started` starts it immediately; `enabled: true` ensures it starts on boot. This is idempotent — Ansible won't restart nginx if it's already running.

---

## Result

Running the fixed playbook:
1. Installs nginx via apt (with cache update)
2. Starts nginx and enables it to survive reboots
3. Running the playbook a second time reports 0 changes (idempotent)
