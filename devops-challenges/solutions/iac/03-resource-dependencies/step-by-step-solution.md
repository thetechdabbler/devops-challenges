# Solution — Resource Dependencies

## Fixes Applied

### Fix 1 & 4: Use resource reference with `.id` for security group

```hcl
# Before
vpc_security_group_ids = [aws_security_group.web.name]

# After
vpc_security_group_ids = [aws_security_group.web.id]
```

`vpc_security_group_ids` requires a list of security group IDs (strings like `sg-abc123`). Using `.name` gives the human-readable name, not the AWS ID — causing an API error. Using the resource reference also creates an implicit dependency so the SG is created before the EC2 instance.

### Fix 2: Replace hardcoded subnet ID

```hcl
# Before
subnet_id = "subnet-12345"

# After
subnet_id = aws_subnet.main.id
```

Hardcoded IDs break portability — they only work in the specific AWS account and region where they were created. Using the resource reference creates an implicit dependency and works anywhere.

### Fix 3: IGW already has implicit dependency (not a real bug)

The `aws_internet_gateway.main` already uses `vpc_id = aws_vpc.main.id`, creating an implicit dependency. No fix needed here.

### Fix 5: Use `.id` for route table association

```hcl
# Before
subnet_id = aws_subnet.main.name   # .name doesn't exist on subnet

# After
subnet_id = aws_subnet.main.id
```

`aws_subnet` doesn't have a `.name` attribute — it has a `tags` map. Using `.name` causes `terraform validate` to fail with "Unsupported attribute".

---

## Result

Terraform builds the dependency graph:
```
aws_vpc → aws_subnet → aws_route_table_association
       → aws_internet_gateway → aws_route_table
       → aws_security_group → aws_instance
```

All resources are created in the correct order automatically.
