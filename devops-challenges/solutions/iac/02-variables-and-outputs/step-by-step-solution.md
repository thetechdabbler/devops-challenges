# Solution — Variables and Outputs

## Fixes Applied

### Fix 1: Add `type = string` to variable

```hcl
variable "instance_type" {
  type = string   # ← added
  ...
}
```

Without a type constraint, Terraform accepts any type for the variable. Adding `type = string` enables type checking and validation.

### Fix 2: Default value must match type

```hcl
# Before
default = "1"   # string

# After
default = 1     # number
```

`variable "instance_count"` has `type = number`. A string default `"1"` causes `terraform validate` to error: "Invalid default value for variable... string is not compatible with number."

### Fix 3: Add `value =` to output

```hcl
output "instance_ip" {
  value       = aws_instance.web[*].public_ip   # ← added
  description = "Public IP of the web instance"
}
```

`value` is required for output blocks. Without it, `terraform validate` fails with "Missing required argument: value".

### Fix 4: Mark sensitive output

```hcl
output "db_password" {
  value     = var.db_password
  sensitive = true   # ← added
}
```

Without `sensitive = true`, the password appears in plain text in `terraform output` and in CI logs. Marking it sensitive causes the value to be displayed as `<sensitive>`.

### Fix 5: Fix validation condition operator

```hcl
# Before
condition = var.environment = "dev" || ...   # assignment operator!

# After
condition = var.environment == "dev" || ...  # comparison operator
```

`=` is assignment (invalid in HCL expression context). `==` is equality comparison. This is a syntax error caught by `terraform validate`.
