# Resources — Variables and Outputs

## Variable Types

```hcl
variable "name"  { type = string }
variable "count" { type = number }
variable "enabled" { type = bool }
variable "tags"  { type = map(string) }
variable "ports" { type = list(number) }
variable "subnet" {
  type = object({
    id   = string
    cidr = string
  })
}
```

## Variable Validation

```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}
```

## Outputs

```hcl
output "instance_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP address"
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true   # hides value in output, logs
}
```

## Variable Precedence (low → high)

1. Default values in `variable {}` blocks
2. `terraform.tfvars` file
3. `*.auto.tfvars` files
4. `-var` flag
5. `-var-file` flag
6. Environment variables (`TF_VAR_name`)

## Official Docs

- [Input variables](https://developer.hashicorp.com/terraform/language/values/variables)
- [Output values](https://developer.hashicorp.com/terraform/language/values/outputs)
- [Custom validation](https://developer.hashicorp.com/terraform/language/values/variables#custom-validation-rules)
