# 09 — Jenkins Pipeline Basics

**Level**: Advanced | **Topic**: CI

Write a declarative Jenkinsfile that builds and tests the Flask app with proper Docker agent, virtualenv, test reporting, and branch conditions. Five issues to fix.

## Prerequisites

- Jenkins running locally (Docker: `docker run -p 8080:8080 jenkins/jenkins:lts`)
- Docker plugin installed in Jenkins
- Blue Ocean or Pipeline plugin

## Quick Start

```bash
# Run Jenkins locally
docker run -d -p 8080:8080 -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Create a Pipeline job pointing to this repo
# Fix the 5 issues in starter/Jenkinsfile and push
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/09-jenkins-pipeline-basics/`](../../../solutions/ci/09-jenkins-pipeline-basics/)
