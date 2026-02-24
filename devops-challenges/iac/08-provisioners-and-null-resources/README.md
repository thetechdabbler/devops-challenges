# Exercise 08 — Provisioners and Null Resources

Fix a Terraform configuration that uses `null_resource` with `local-exec` and `remote-exec` provisioners to bootstrap an EC2 instance.

## Quick Start

```bash
terraform init
terraform validate
terraform plan
```

## Files

```
starter/
  main.tf          — provisioner config (5 bugs)
solutions/
  main.tf          — fixed config
  step-by-step-solution.md
```
