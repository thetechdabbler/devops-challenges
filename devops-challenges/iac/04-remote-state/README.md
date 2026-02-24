# Exercise 04 — Remote State

Fix a Terraform S3 backend configuration for shared, encrypted, and locked state management.

## Quick Start

```bash
# After fixing backend.tf:
terraform init -reconfigure

# Create a new workspace
terraform workspace new staging
terraform workspace list

# Apply in workspace context
terraform apply
```

## Files

- `starter/backend.tf` — broken S3 backend config (5 bugs)
- `starter/main.tf` — sample resource
- `solutions/backend.tf` — fixed config
- `solutions/step-by-step-solution.md` — explanation
