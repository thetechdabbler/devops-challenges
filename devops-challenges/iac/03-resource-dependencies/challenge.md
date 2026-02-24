# Challenge — Resource Dependencies

## Scenario

You're provisioning a VPC with a subnet, security group, and EC2 instance. Terraform is creating the EC2 instance before the security group and subnet are ready because dependencies aren't properly expressed.

Fix the configuration so resources are created in the correct order.

## Your Task

The file `starter/main.tf` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **EC2 instance references security group by name string** — `security_groups = ["my-sg"]` instead of using the resource reference `[aws_security_group.web.id]`
2. **Subnet ID hardcoded** — `subnet_id = "subnet-12345"` instead of `aws_subnet.main.id`
3. **Missing `depends_on`** — the Internet Gateway doesn't explicitly depend on the VPC (should use reference instead)
4. **Wrong attribute reference** — `aws_security_group.web.name` used where `.id` is required
5. **Route table association references wrong resource** — `subnet_id = aws_subnet.main.name` (`.name` doesn't exist; use `.id`)

## Acceptance Criteria

- [ ] `terraform validate` passes
- [ ] `terraform plan` shows resources in correct dependency order
- [ ] EC2 instance creation waits for security group and subnet
- [ ] No hardcoded IDs in any resource arguments
- [ ] `terraform graph | dot -Tsvg > graph.svg` shows a clean dependency graph

## Learning Notes

**Implicit dependencies (preferred):**
```hcl
resource "aws_instance" "web" {
  subnet_id              = aws_subnet.main.id           # ← implicit dep on subnet
  vpc_security_group_ids = [aws_security_group.web.id]  # ← implicit dep on SG
}
```

**Explicit dependencies (use sparingly):**
```hcl
resource "aws_instance" "web" {
  depends_on = [aws_internet_gateway.main]   # when no attribute reference exists
}
```

**Terraform dependency graph:**
```bash
terraform graph | dot -Tsvg > graph.svg   # requires graphviz
```
