# Challenge — Variables and Outputs

## Scenario

Your Terraform configuration uses input variables and outputs to make the EC2 provisioning reusable. But variables are defined without types, defaults are the wrong type, outputs are missing `value =`, and sensitive values are being output without marking them as sensitive.

Fix the variables and outputs so the configuration is type-safe and doesn't leak secrets.

## Your Task

The file `starter/variables.tf` and `starter/outputs.tf` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Variable missing `type`** — `variable "instance_type"` has no type constraint
2. **Default value wrong type** — `variable "instance_count"` has `default = "1"` (string, should be number `1`)
3. **Output missing `value =`** — `output "instance_ip"` block has no `value` argument
4. **Sensitive output not marked** — `output "db_password"` outputs a sensitive value but `sensitive = true` is missing
5. **Variable validation wrong operator** — `condition` in validation block uses `=` (assignment) instead of `==` (comparison)

## Acceptance Criteria

- [ ] `terraform validate` passes with all variables and outputs defined
- [ ] `instance_count` only accepts numbers (type constraint enforced)
- [ ] `instance_type` validates that only `t3.*` instance types are accepted
- [ ] `output "db_password"` is marked `sensitive = true`
- [ ] `terraform output instance_ip` shows the IP without warnings

## Learning Notes

**Variable syntax:**
```hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"

  validation {
    condition     = can(regex("^t3\\.", var.instance_type))
    error_message = "Only t3.* instance types are allowed."
  }
}

variable "instance_count" {
  type    = number
  default = 1
}
```

**Output syntax:**
```hcl
output "instance_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP of the web instance"
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true   # masked in CLI output
}
```
