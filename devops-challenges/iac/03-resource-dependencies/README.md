# Exercise 03 — Resource Dependencies

Fix a Terraform VPC configuration so resources are created in the correct dependency order.

## Quick Start

```bash
terraform init
terraform validate
terraform plan

# Visualize dependencies (requires graphviz)
terraform graph | dot -Tsvg > graph.svg
```

## Files

- `starter/main.tf` — broken resource dependencies (5 bugs)
- `solutions/main.tf` — fixed config
- `solutions/step-by-step-solution.md` — explanation
