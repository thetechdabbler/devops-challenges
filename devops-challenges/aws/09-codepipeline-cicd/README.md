# Exercise 09 — CodePipeline CI/CD

Fix a CodePipeline, CodeBuild, and buildspec configuration to build and deploy an application automatically.

## Quick Start

```bash
aws cloudformation validate-template --template-body file://starter/pipeline.yml
aws cloudformation deploy --template-file starter/pipeline.yml --stack-name devops-pipeline \
  --capabilities CAPABILITY_IAM
```

## Files

```
starter/
  buildspec.yml        — CodeBuild build spec (2 bugs)
  pipeline.yml         — CodePipeline CloudFormation (3 bugs)
solutions/
  buildspec.yml
  pipeline.yml
  step-by-step-solution.md
```
