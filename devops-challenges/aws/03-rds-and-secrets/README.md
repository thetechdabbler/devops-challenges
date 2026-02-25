# Exercise 03 — RDS and Secrets Manager

Fix a CloudFormation template and helper script that provision a private RDS PostgreSQL instance with credentials stored in Secrets Manager.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/rds.yml
bash starter/connect.sh
```

## Files

```
starter/
  rds.yml          — CloudFormation template (3 bugs)
  connect.sh       — DB connection helper (2 bugs)
solutions/
  rds.yml
  connect.sh
  step-by-step-solution.md
```
