# Resources — Your First Playbook

## Playbook Structure

```yaml
---
- name: Play name
  hosts: group_or_host
  become: true
  vars:
    key: value

  tasks:
    - name: Task name
      module.name:
        param: value
```

## Commonly Used Modules

```bash
# Package management
ansible.builtin.apt          # Debian/Ubuntu
ansible.builtin.yum          # RHEL/CentOS
ansible.builtin.package      # distro-agnostic

# Service management
ansible.builtin.service      # start/stop/enable/disable

# File management
ansible.builtin.copy         # copy files to remote
ansible.builtin.template     # Jinja2 template rendering
ansible.builtin.file         # create dirs, set permissions

# Command execution
ansible.builtin.command      # run a command (no shell features)
ansible.builtin.shell        # run via shell (supports pipes, redirects)
```

## Inventory File Format

```ini
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[dbservers]
db1 ansible_host=192.168.1.20

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
```

## Key ansible-playbook Flags

```bash
--check        # dry run (no changes made)
--diff         # show file diffs
-v / -vvv     # verbose output
--limit web1   # target a single host
--tags tag1    # run only tagged tasks
--syntax-check # validate YAML only
--list-hosts   # show hosts that would be targeted
--list-tasks   # show tasks that would run
```

## Official Docs

- [Ansible playbook intro](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
- [Module index](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/)
- [Inventory guide](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)
