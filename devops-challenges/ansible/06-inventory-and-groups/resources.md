# Resources — Inventory and Groups

## INI Inventory Format

```ini
[webservers]
web1 ansible_host=10.0.0.1 http_port=8080   # host var inline
web2 ansible_host=10.0.0.2

[dbservers]
db1 ansible_host=10.0.1.1

[production:children]    # group of groups
webservers
dbservers

[all:vars]
ansible_user=ubuntu
ansible_python_interpreter=/usr/bin/python3
```

## YAML Inventory Format

```yaml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 10.0.0.1
        web2:
          ansible_host: 10.0.0.2
    dbservers:
      hosts:
        db1:
          ansible_host: 10.0.1.1
```

## group_vars and host_vars

```
inventory/
  hosts.ini
  group_vars/
    all.yml
    webservers.yml
  host_vars/
    web1.yml
```

## Inventory CLI Commands

```bash
# List all hosts and vars
ansible-inventory -i inventory.ini --list

# Show group tree
ansible-inventory -i inventory.ini --graph

# Show resolved vars for a host
ansible-inventory -i inventory.ini --host web1

# Ping all hosts
ansible all -i inventory.ini -m ping
```

## Official Docs

- [Inventory basics](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)
- [group_vars and host_vars](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html#organizing-host-and-group-variables)
