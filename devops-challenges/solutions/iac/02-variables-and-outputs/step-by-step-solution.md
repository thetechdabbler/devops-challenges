# Step-by-Step Solution — Variables and Outputs

## Bug 1 — Missing `type` in `instance_type` variable

Variables should always have a `type` constraint so Terraform can validate input.

```hcl
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
```

## Bug 2 — String default for number variable

`instance_count` is declared as `number` but the default is `"1"` (a string). This causes a type mismatch.

```hcl
# Wrong
default = "1"

# Fixed
default = 1
```

## Bug 3 — Output missing `value` argument

`value` is required in every `output` block. Without it, Terraform errors during validate.

```hcl
output "instance_ip" {
  value = aws_instance.web[*].public_ip
}
```

## Bug 4 — Sensitive output not marked sensitive

Outputting a `sensitive` variable without `sensitive = true` on the output causes Terraform to error: _"Output refers to sensitive values."_

```hcl
output "db_password" {
  value     = var.db_password
  sensitive = true
}
```

## Bug 5 — Single `=` in validation condition

`=` is assignment, `==` is comparison. The validation condition must be a boolean expression.

```hcl
# Wrong
condition = var.environment = "dev"

# Fixed
condition = contains(["dev", "staging", "prod"], var.environment)
```

## Verify

```bash
terraform validate
terraform plan -var="db_password=secret"
```
