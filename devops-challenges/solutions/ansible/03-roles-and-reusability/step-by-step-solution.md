# Solution — Roles and Reusability

## Fixes Applied

### Fix 1: Template path in role

```yaml
# Before
src: templates/nginx.conf.j2

# After
src: nginx.conf.j2
```

Inside a role, the `template` module automatically searches `roles/webserver/templates/`. Using `templates/nginx.conf.j2` creates a double-path lookup that fails. Just use the filename.

### Fix 2: Define the handler

```yaml
# handlers/main.yml
- name: Restart nginx
  ansible.builtin.service:
    name: nginx
    state: restarted
```

A `notify:` that references an undefined handler silently succeeds in some versions and errors in others. The handler must be defined with exactly the same name used in `notify:`.

### Fix 3: Use `http_port` default in template

```jinja2
# Before
listen 80;

# After
listen {{ http_port }};
```

The whole point of `defaults/main.yml` is to make values configurable. Using a hardcoded `80` means the default is ignored and can't be overridden via inventory or play vars.

### Fix 4: Add `roles:` block to site.yml

```yaml
roles:
  - webserver
```

Without the `roles:` block, Ansible runs the play but applies no role — the play is essentially a no-op.

### Fix 5: Replace `include` with `import_tasks`

```yaml
# Before
include: extra_tasks.yml

# After
ansible.builtin.import_tasks: extra_tasks.yml
```

`include` was deprecated in Ansible 2.4 and removed in later versions. Use `import_tasks` (static, parse-time) or `include_tasks` (dynamic, runtime).
