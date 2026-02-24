# Resources — Conditionals and Loops

## OS Detection Variables

```bash
# Gather facts to see available variables
ansible host -i inventory.ini -m setup | grep ansible_distribution

# Common variables
ansible_distribution         # Ubuntu, CentOS, Debian, RedHat...
ansible_distribution_version # 22.04, 8.5...
ansible_os_family            # Debian, RedHat, Suse, FreeBSD...
ansible_architecture         # x86_64, aarch64...
```

## Conditionals Syntax

```yaml
when: ansible_os_family == "Debian"
when: ansible_distribution in ["Ubuntu", "Debian"]
when: ansible_distribution_version is version("20.04", ">=")
when:
  - ansible_os_family == "Debian"
  - ansible_distribution_version is version("20.04", ">=")
```

## Loops

```yaml
# Simple list
loop:
  - item1
  - item2

# Dict list
loop:
  - { name: alice, uid: 1001 }
  - { name: bob, uid: 1002 }

# loop_control — custom loop variable name
loop_control:
  loop_var: user
  label: "{{ user.name }}"
```

## register + failed_when

```yaml
- name: Check service status
  ansible.builtin.command: systemctl is-active myapp
  register: svc_status
  failed_when: false   # don't fail on non-zero exit

- name: Restart if not active
  ansible.builtin.service:
    name: myapp
    state: restarted
  when: svc_status.stdout != "active"
```

## Official Docs

- [Conditionals](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html)
- [Loops](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html)
- [register](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#registering-variables)
