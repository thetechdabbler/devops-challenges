# Exercise 02 — S3 and IAM

Fix an IAM role trust policy and S3 bucket policy so an EC2 instance can securely read deployment artifacts.

## Quick Start

```bash
# Validate IAM policy syntax
aws iam validate-policy-syntax \
  --policy-type identity \
  --policy-document file://starter/iam-policy.json

# Check S3 bucket policy
aws s3api get-bucket-policy --bucket devops-artifacts
```

## Files

```
starter/
  trust-policy.json    — IAM role trust policy (1 bug)
  iam-policy.json      — IAM permissions policy (2 bugs)
  bucket-policy.json   — S3 bucket policy (1 bug)
  setup.sh             — CLI commands (1 bug)
solutions/
  trust-policy.json
  iam-policy.json
  bucket-policy.json
  setup.sh
  step-by-step-solution.md
```
