# Challenge — Variables and Templates

## Scenario

Your team manages nginx config with Jinja2 templates and Ansible variables. The playbook deploys a templated nginx config, but the template has syntax errors, variables are defined in the wrong scope, and the config doesn't reload after the template changes.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong template variable syntax** — `{server_name}` instead of `{{ server_name }}`
2. **Variable defined at task level** — `vars:` block under a task isn't valid (use `vars:` at play level)
3. **Template module missing `dest`** — the template task has no `dest:` key
4. **Wrong template filter** — `{{ port | string }}` is unnecessary since port is already used as a number in config
5. **No handler notify** — template task doesn't notify the reload-nginx handler

## Acceptance Criteria

- [ ] `ansible-playbook --syntax-check` passes
- [ ] Template renders with correct `server_name` and `listen` port
- [ ] Changing a variable value triggers nginx config reload (not restart)
- [ ] Variables defined at play level are accessible in the template
- [ ] `nginx -t` (config test) passes on all hosts after deploy

## Learning Notes

**Jinja2 in Ansible:**
```jinja2
# Variables
{{ variable_name }}

# Conditionals
{% if env == "production" %}
worker_processes auto;
{% else %}
worker_processes 1;
{% endif %}

# Loops
{% for host in upstream_hosts %}
server {{ host }};
{% endfor %}
```

**Variable precedence (low → high):**
1. Role defaults
2. Inventory vars
3. Playbook `vars:`
4. Task `vars:` (use sparingly)
5. Extra vars (`-e`)
