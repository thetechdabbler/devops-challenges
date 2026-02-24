# Challenge — Roles and Reusability

## Scenario

Your team packages the nginx deployment logic as an Ansible role named `webserver`. A colleague started the role structure but it has broken task references, a missing handler, defaults not being used, and the role isn't called correctly from the playbook.

Fix the role and the site playbook so the webserver role is reusable and self-contained.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`tasks/main.yml` references a non-existent template path** — templates go in `roles/webserver/templates/`, not `templates/`
2. **Handler not defined** — `roles/webserver/handlers/main.yml` is empty but the task notifies `Restart nginx`
3. **Default variable not used** — `roles/webserver/defaults/main.yml` defines `http_port: 80` but the template hardcodes port 80 instead of using `{{ http_port }}`
4. **Role not listed in site.yml** — `roles:` block is missing from the playbook
5. **Role `tasks/main.yml` uses deprecated `include` instead of `import_tasks`**

## Acceptance Criteria

- [ ] `ansible-playbook site.yml --syntax-check` passes
- [ ] `http_port` default of 80 is used in the nginx config template
- [ ] Changing `http_port` via inventory/vars overrides the role default
- [ ] Updating the nginx config template notifies the handler to restart nginx
- [ ] The role can be applied to any host group by changing `hosts:` in site.yml

## Learning Notes

**Role directory structure:**
```
roles/webserver/
  tasks/main.yml        # task list
  handlers/main.yml     # handlers
  templates/nginx.j2    # Jinja2 templates
  defaults/main.yml     # default variable values
  vars/main.yml         # role-internal variables (higher priority)
  files/                # static files for copy module
  meta/main.yml         # role metadata, dependencies
```

**Calling a role:**
```yaml
---
- name: Configure web servers
  hosts: webservers
  become: true
  roles:
    - webserver
    - { role: webserver, http_port: 8080 }  # with var override
```
