# Resources — Ansible Galaxy

## requirements.yml Format

```yaml
roles:
  # From Galaxy (shorthand)
  - name: geerlingguy.nginx
    version: "3.2.0"

  # From GitHub
  - src: https://github.com/geerlingguy/ansible-role-nginx
    name: nginx
    version: master

collections:
  - name: community.general
    version: ">=5.0.0"
  - name: amazon.aws
    version: "3.0.0"
```

## Galaxy CLI Commands

```bash
# Install roles
ansible-galaxy install -r requirements.yml
ansible-galaxy install -r requirements.yml --roles-path ./roles
ansible-galaxy role install geerlingguy.nginx

# Install collections
ansible-galaxy collection install -r requirements.yml
ansible-galaxy collection install community.general

# List installed
ansible-galaxy role list
ansible-galaxy collection list

# Remove a role
ansible-galaxy role remove geerlingguy.nginx
```

## ansible.cfg Configuration

```ini
[defaults]
roles_path = ./roles:~/.ansible/roles:/usr/share/ansible/roles
collections_paths = ./collections:~/.ansible/collections
inventory = ./inventory.ini
remote_user = ubuntu
```

## Official Docs

- [Galaxy user guide](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html)
- [requirements.yml format](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-roles-from-files)
- [ansible.cfg reference](https://docs.ansible.com/ansible/latest/reference_appendices/config.html)
