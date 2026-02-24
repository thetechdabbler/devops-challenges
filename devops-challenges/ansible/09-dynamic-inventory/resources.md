# Resources — Dynamic Inventory

## aws_ec2 Plugin Config Reference

```yaml
plugin: amazon.aws.aws_ec2

regions:
  - us-east-1
  - us-west-2

filters:
  instance-state-name: running
  tag:Environment: production     # tag filter syntax: tag:TagName

keyed_groups:
  - key: tags.Name
    prefix: name
  - key: tags.Role
    prefix: role

hostnames:
  - private-ip-address            # use private IP as hostname
  - dns-name                      # fallback to public DNS

compose:
  ansible_host: private_ip_address   # set SSH target IP

groups:
  webservers: "'web' in tags.Role"
  dbservers: "'db' in tags.Role"
```

## ansible.cfg for Dynamic Inventory

```ini
[defaults]
inventory = ./aws_ec2.yml

[inventory]
enable_plugins = amazon.aws.aws_ec2, host_list, yaml, ini
```

## Useful Commands

```bash
# List all hosts and their vars
ansible-inventory -i aws_ec2.yml --list

# Show group tree
ansible-inventory -i aws_ec2.yml --graph

# Test connection to all discovered hosts
ansible all -i aws_ec2.yml -m ping

# Run playbook with dynamic inventory
ansible-playbook -i aws_ec2.yml playbook.yml
```

## Official Docs

- [aws_ec2 inventory plugin](https://docs.ansible.com/ansible/latest/collections/amazon/aws/aws_ec2_inventory.html)
- [Dynamic inventory guide](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
