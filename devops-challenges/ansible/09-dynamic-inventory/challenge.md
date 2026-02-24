# Challenge — Dynamic Inventory

## Scenario

Your team runs Ansible against AWS EC2 instances. Instead of maintaining a static `inventory.ini`, you use the `amazon.aws.aws_ec2` dynamic inventory plugin to auto-discover instances by their tags.

The inventory plugin config has bugs: instances aren't filtered correctly, hostname construction is wrong, and the plugin isn't enabled in `ansible.cfg`.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Plugin not enabled** — `ansible.cfg` doesn't list `amazon.aws.aws_ec2` under `[inventory] enable_plugins`
2. **Wrong `plugin:` key** — inventory YAML uses `plugin: ec2` instead of `plugin: amazon.aws.aws_ec2`
3. **`filters` uses wrong tag syntax** — should be `tag:Environment` not `tags.Environment`
4. **`hostnames` constructed incorrectly** — using `private_ip_address` directly, should use `network_interfaces[0].private_ip_address` or `private_ip_address`
5. **`compose` block missing** — no `ansible_host` assignment means Ansible can't SSH to instances

## Acceptance Criteria

- [ ] `ansible-inventory -i aws_ec2.yml --list` returns EC2 instances
- [ ] Only instances tagged `Environment: production` are returned
- [ ] `ansible_host` is set to each instance's private IP
- [ ] Instances are grouped by `Name` tag value
- [ ] `ansible.cfg` enables the dynamic inventory plugin

## Learning Notes

**aws_ec2 plugin config:**
```yaml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
filters:
  tag:Environment: production    # ← correct tag filter syntax
keyed_groups:
  - key: tags.Name
    prefix: tag
hostnames:
  - private-ip-address
compose:
  ansible_host: private_ip_address
```

**Required setup:**
```bash
# Install AWS collection
ansible-galaxy collection install amazon.aws

# Set AWS credentials
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
# Or use ~/.aws/credentials
```
