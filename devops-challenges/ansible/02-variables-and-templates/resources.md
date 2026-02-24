# Resources — Variables and Templates

## Variable Scopes

```yaml
---
- name: Play with variables
  hosts: webservers
  vars:                          # play-level vars (preferred)
    server_name: example.com
    port: 80

  tasks:
    - name: Deploy template
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
        mode: "0644"
      notify: Reload nginx
      vars:                      # task-level vars (override play-level)
        port: 8080
```

## Jinja2 Template Syntax

```jinja2
# Variable substitution
{{ variable_name }}
{{ dict.key }}
{{ list[0] }}

# Filters
{{ name | upper }}
{{ items | join(", ") }}
{{ value | default("fallback") }}

# Control flow
{% if condition %}...{% endif %}
{% for item in list %}{{ item }}{% endfor %}

# Comments (not rendered)
{# This is a comment #}
```

## Template Module Options

```yaml
- ansible.builtin.template:
    src: templates/config.j2    # relative to playbook dir
    dest: /etc/app/config.conf  # remote path
    owner: root
    group: root
    mode: "0644"
    validate: nginx -t -c %s    # validate before deploy
  notify: Reload nginx
```

## Official Docs

- [Ansible variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)
- [Jinja2 templating](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_templating.html)
- [template module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html)
