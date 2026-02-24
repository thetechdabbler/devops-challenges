# Exercise 02 — Variables and Outputs

Fix Terraform variable definitions and outputs for type safety and secret protection.

## Quick Start

```bash
terraform init
terraform validate
terraform plan -var="instance_type=t3.micro" -var="instance_count=2"
terraform output instance_ip
```

## Files

- `starter/main.tf` — EC2 resource using variables
- `starter/variables.tf` — broken variable definitions (3 bugs)
- `starter/outputs.tf` — broken output definitions (2 bugs)
- `solutions/` — fixed files
