# Challenge — CodePipeline CI/CD

## Scenario

Your team uses AWS CodePipeline with CodeBuild and CodeDeploy to build and deploy an application. A colleague wrote the `buildspec.yml` and the pipeline CloudFormation template but got the artifact output name wrong, used the wrong CodeBuild environment type, broke the source action provider, and forgot the pipeline service role.

Fix the files so the pipeline builds and deploys successfully.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`buildspec.yml` phases order wrong** — `post_build` runs before `build` in the starter; correct order is `install → pre_build → build → post_build`
2. **Wrong source action provider** — `Provider: GitHub` requires a connection ARN; the starter uses `Provider: Github` (wrong case) — AWS CodePipeline uses `GitHub` (capital H) and `CodeStarSourceConnection`
3. **CodeBuild environment type wrong** — `Type: LINUX_CONTAINER` is correct but the starter uses `Type: LINUX` which is invalid
4. **Pipeline missing `RoleArn`** — the `AWS::CodePipeline::Pipeline` resource must have a `RoleArn` pointing to the pipeline execution role
5. **Artifact output name mismatch** — the Build stage outputs `BuildArtifact` but the Deploy stage's `InputArtifacts` references `BuildOutput` — names must match

## Acceptance Criteria

- [ ] `buildspec.yml` phases are in correct order
- [ ] Source provider is `CodeStarSourceConnection` with GitHub connection
- [ ] CodeBuild environment type is `LINUX_CONTAINER`
- [ ] Pipeline has `RoleArn`
- [ ] Artifact names are consistent

## Learning Notes

**buildspec.yml:**
```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.12
  pre_build:
    commands:
      - pip install -r requirements.txt
  build:
    commands:
      - pytest tests/
      - docker build -t $IMAGE_URI .
  post_build:
    commands:
      - docker push $IMAGE_URI
artifacts:
  files:
    - appspec.yml
    - taskdef.json
```

**CodePipeline artifact consistency:**
```yaml
# Build stage output
OutputArtifacts:
  - Name: BuildArtifact

# Deploy stage must reference same name
InputArtifacts:
  - Name: BuildArtifact
```
