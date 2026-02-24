# Resources — Roles and Reusability

## Role Directory Layout

```
roles/
  webserver/
    tasks/
      main.yml          # entry point — always executed
      install.yml       # can be imported from main.yml
    handlers/
      main.yml          # handlers notified by tasks
    templates/
      nginx.conf.j2     # Jinja2 templates
    files/
      index.html        # static files (for copy module)
    defaults/
      main.yml          # lowest priority defaults
    vars/
      main.yml          # high priority role-internal vars
    meta/
      main.yml          # dependencies, Galaxy info
```

## Using Roles in a Playbook

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: true
  roles:
    - webserver
    - { role: webserver, http_port: 8080 }

  # Or with include_role (dynamic)
  tasks:
    - ansible.builtin.include_role:
        name: webserver
      vars:
        http_port: 9090
```

## Role Defaults vs Vars

| File | Priority | Use case |
|------|----------|---------|
| `defaults/main.yml` | Lowest | Values users should override |
| `vars/main.yml` | High | Internal role constants |

## `import_tasks` vs `include_tasks`

| | `import_tasks` | `include_tasks` |
|---|---|---|
| Time | Parse time (static) | Runtime (dynamic) |
| `when:` | Applied to each task | Applied to include itself |
| Tags | Inherited by tasks | Only on include |

## Official Docs

- [Ansible roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html)
- [Role directory structure](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#role-directory-structure)
