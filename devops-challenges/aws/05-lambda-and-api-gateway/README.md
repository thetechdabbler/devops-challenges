# Exercise 05 — Lambda and API Gateway

Fix a Lambda function and API Gateway CloudFormation template so HTTP requests are routed to the Lambda handler.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/template.yml
aws cloudformation deploy --template-file starter/template.yml --stack-name devops-lambda
```

## Files

```
starter/
  template.yml           — CloudFormation template (4 bugs)
  lambda_function.py     — Lambda handler (1 bug)
solutions/
  template.yml
  lambda_function.py
  step-by-step-solution.md
```
