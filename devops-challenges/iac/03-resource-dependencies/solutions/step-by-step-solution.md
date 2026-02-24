# Step-by-Step Solution — Resource Dependencies

## Bug 1 — Security group ID passed as name string

`vpc_security_group_ids` expects a list of security group **IDs**, not a list of names.

```hcl
# Wrong
vpc_security_group_ids = [aws_security_group.web.name]

# Fixed
vpc_security_group_ids = [aws_security_group.web.id]
```

This also creates an implicit dependency so Terraform creates the SG before the instance.

## Bug 2 — Hardcoded subnet ID

Hardcoding `"subnet-12345"` breaks the dependency graph and won't work in any real account.

```hcl
# Wrong
subnet_id = "subnet-12345"

# Fixed
subnet_id = aws_subnet.main.id
```

## Bug 3 — Missing explicit `depends_on`

The challenge hinted at a `depends_on` bug. The route table association must exist before the instance is useful, but Terraform doesn't automatically connect them. Adding `depends_on` makes the ordering explicit if needed.

_(In the starter this is represented by the hardcoded subnet ID in Bug 2 — fixing that reference resolves the ordering.)_

## Bug 4 — Attribute `.name` instead of `.id` in security group reference

`.name` is the string `"web-sg"`, not the AWS security group ID (`sg-xxxx`). The API rejects names in the `vpc_security_group_ids` field.

```hcl
vpc_security_group_ids = [aws_security_group.web.id]
```

## Bug 5 — Route table association uses `.name` instead of `.id`

`aws_route_table_association.subnet_id` must be the subnet resource ID, not its name tag.

```hcl
# Wrong
subnet_id = aws_subnet.main.name

# Fixed
subnet_id = aws_subnet.main.id
```

## Verify

```bash
terraform validate
terraform plan
```

The plan should show all resources with proper dependency ordering.
