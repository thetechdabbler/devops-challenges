# Exercise 06 — CloudWatch Alarms

Fix CloudWatch alarm configuration so EC2 CPU and error rate alarms fire reliably.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/alarms.yml
aws cloudformation deploy --template-file starter/alarms.yml --stack-name devops-alarms
```

## Files

```
starter/
  alarms.yml           — CloudFormation alarm template (5 bugs)
solutions/
  alarms.yml           — fixed template
  step-by-step-solution.md
```
