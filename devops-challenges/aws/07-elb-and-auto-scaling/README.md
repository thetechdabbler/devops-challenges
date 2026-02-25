# Exercise 07 — ELB and Auto Scaling

Fix an Application Load Balancer and Auto Scaling Group CloudFormation template so traffic routes correctly and the group scales on CPU.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/alb-asg.yml
aws cloudformation deploy --template-file starter/alb-asg.yml --stack-name devops-alb-asg \
  --capabilities CAPABILITY_IAM
```

## Files

```
starter/
  alb-asg.yml          — CloudFormation template (5 bugs)
solutions/
  alb-asg.yml          — fixed template
  step-by-step-solution.md
```
