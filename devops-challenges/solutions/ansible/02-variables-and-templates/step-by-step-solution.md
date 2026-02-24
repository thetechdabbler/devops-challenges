# Solution — Variables and Templates

## Fixes Applied

### Fix 1: Jinja2 variable syntax in template

```jinja2
# Before
listen {port};

# After
listen {{ port }};
```

Jinja2 requires double curly braces `{{ }}` to evaluate expressions. Single braces are treated as literal text — nginx would try to listen on the string `{port}` and fail config validation.

### Fix 2: Move `vars:` to play level

```yaml
# Before (task level)
tasks:
  - name: Deploy nginx config
    vars:
      server_name: myapp.example.com
      port: 80

# After (play level)
vars:
  server_name: myapp.example.com
  port: 80
tasks:
  - name: Deploy nginx config
    ...
```

Play-level `vars:` are available to all tasks and templates in the play, including handlers. Task-level `vars:` only exist for that specific task — the template module can't access them reliably.

### Fix 3: Add `dest:` to template task

```yaml
ansible.builtin.template:
  src: templates/nginx.conf.j2
  dest: /etc/nginx/sites-available/default
```

Without `dest:`, Ansible raises `missing required arguments: dest`.

### Fix 4: Remove unnecessary `| string` filter

```jinja2
# Before
{{ server_name | string }}

# After
{{ server_name }}
```

`server_name` is already a string. The `| string` filter does nothing here and adds noise.

### Fix 5: Add `notify: Reload nginx`

```yaml
- name: Deploy nginx config
  ansible.builtin.template:
    ...
  notify: Reload nginx
```

Without `notify`, Ansible deploys the new config but never reloads nginx — the running server keeps using the old config. `notify` triggers the handler only when the task makes a change (idempotent).
