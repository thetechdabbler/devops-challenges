# Exercise 08 — VPC Networking

Fix a CloudFormation template that builds a VPC with public and private subnets, internet gateway, and NAT gateway.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/vpc.yml
aws cloudformation deploy --template-file starter/vpc.yml --stack-name devops-vpc
```

## Files

```
starter/
  vpc.yml              — VPC CloudFormation template (5 bugs)
solutions/
  vpc.yml              — fixed template
  step-by-step-solution.md
```
