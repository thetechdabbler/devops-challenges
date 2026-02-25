# Step-by-Step Solution — CodePipeline CI/CD

## Bug 1 — `buildspec.yml` phases out of order

CodeBuild executes phases in the fixed sequence: `install → pre_build → build → post_build`. Having `post_build` defined before `build` in YAML doesn't reorder execution — but pushing before building means you push a stale or missing image.

```yaml
phases:
  install: ...
  pre_build: ...
  build: ...
  post_build: ...
```

## Bug 2 — Wrong source action provider

GitHub sources use the `CodeStarSourceConnection` provider with an `Owner: AWS`. The old `ThirdParty/Github` integration is deprecated.

```yaml
ActionTypeId:
  Owner: AWS
  Provider: CodeStarSourceConnection
Configuration:
  ConnectionArn: !Ref GitHubConnection
  FullRepositoryId: myorg/devops-app
  BranchName: main
```

## Bug 3 — Invalid CodeBuild environment type `LINUX`

Valid values are `LINUX_CONTAINER`, `LINUX_GPU_CONTAINER`, `ARM_CONTAINER`, `WINDOWS_SERVER_2022_CONTAINER`.

```yaml
Type: LINUX_CONTAINER
```

## Bug 4 — Pipeline missing `RoleArn`

`RoleArn` is required for `AWS::CodePipeline::Pipeline`. Without it, the pipeline cannot access other services.

```yaml
RoleArn: !GetAtt PipelineRole.Arn
```

## Bug 5 — Artifact name mismatch

The Build stage outputs `BuildArtifact` but the Deploy stage's `InputArtifacts` references `BuildOutput`. Artifact names must match exactly across stages.

```yaml
# Build stage
OutputArtifacts:
  - Name: BuildArtifact

# Deploy stage
InputArtifacts:
  - Name: BuildArtifact
```

## Verify

```bash
aws cloudformation deploy --template-file solutions/pipeline.yml \
  --stack-name devops-pipeline --capabilities CAPABILITY_IAM
aws codepipeline get-pipeline --name devops-app
```
