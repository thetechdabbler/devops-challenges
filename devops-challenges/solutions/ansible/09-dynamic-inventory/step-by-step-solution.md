# Solution — Dynamic Inventory

## Fixes Applied

### Fix 1: Enable plugin in ansible.cfg

```ini
[inventory]
enable_plugins = amazon.aws.aws_ec2, host_list, yaml, ini
```

Without `enable_plugins`, Ansible doesn't know to use the `amazon.aws.aws_ec2` plugin when it finds a `.yml` inventory file. This causes "no inventory was parsed" errors.

### Fix 2: Correct plugin FQCN

```yaml
# Before
plugin: ec2

# After
plugin: amazon.aws.aws_ec2
```

The plugin must be referenced by its fully-qualified collection name (FQCN). The short name `ec2` isn't recognized by Ansible's plugin loader.

### Fix 3: Tag filter syntax

```yaml
# Before
filters:
  tags.Environment: production

# After
filters:
  tag:Environment: production
```

AWS EC2 API uses `tag:TagName` as the filter key syntax. `tags.Environment` is the Python dict access notation from boto3, not valid as a filter key.

### Fix 4 & 5: Add `compose` block for `ansible_host`

```yaml
compose:
  ansible_host: private_ip_address
```

Without `compose`, discovered hosts have no `ansible_host` set. Ansible would try to SSH to the EC2 instance ID (like `i-0abc123`) as the hostname, which fails DNS resolution.

---

## Result

```bash
ansible-inventory -i aws_ec2.yml --graph
@all:
  |--@name_web_prod_01:
  |  |--10.0.1.5
  |--@name_db_prod_01:
  |  |--10.0.2.3
```
