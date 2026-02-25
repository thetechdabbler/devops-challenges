# Resources — CodePipeline CI/CD

## buildspec.yml Structure

```yaml
version: 0.2

env:
  variables:
    IMAGE_REPO: my-app

phases:
  install:
    runtime-versions:
      python: 3.12
    commands:
      - pip install --upgrade pip
  pre_build:
    commands:
      - aws ecr get-login-password | docker login ...
  build:
    commands:
      - docker build -t $IMAGE_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION .
  post_build:
    commands:
      - docker push $IMAGE_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION

artifacts:
  files:
    - appspec.yml
  discard-paths: yes
```

## CodePipeline Structure

```yaml
Pipeline:
  Type: AWS::CodePipeline::Pipeline
  Properties:
    RoleArn: !GetAtt PipelineRole.Arn
    Stages:
      - Name: Source
        Actions:
          - Name: Source
            ActionTypeId:
              Category: Source
              Owner: AWS
              Provider: CodeStarSourceConnection
              Version: "1"
            Configuration:
              ConnectionArn: !Ref GitHubConnection
              FullRepositoryId: org/repo
              BranchName: main
            OutputArtifacts:
              - Name: SourceArtifact

      - Name: Build
        Actions:
          - Name: Build
            ActionTypeId:
              Category: Build
              Owner: AWS
              Provider: CodeBuild
              Version: "1"
            InputArtifacts:
              - Name: SourceArtifact
            OutputArtifacts:
              - Name: BuildArtifact
```

## Official Docs

- [CodePipeline user guide](https://docs.aws.amazon.com/codepipeline/latest/userguide/)
- [buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [CodeBuild environments](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html)
