# Resources — Jenkins Pipeline Basics

## Declarative Pipeline Reference

```groovy
pipeline {
    agent { docker { image 'python:3.11-slim' } }

    environment {
        APP_ENV = 'test'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        pollSCM('H/5 * * * *')   // poll every 5 min
    }

    stages {
        stage('Build') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml'
            }
            post {
                always { junit 'test-results.xml' }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
                // OR: expression { return env.BRANCH_NAME == 'main' }
            }
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        success  { echo 'Build passed' }
        failure  { mail to: 'team@example.com', subject: 'Build failed' }
        always   { cleanWs() }
    }
}
```

## when Conditions

```groovy
when { branch 'main' }
when { tag 'v*' }
when { changeRequest() }
when { environment name: 'DEPLOY', value: 'true' }
when {
    allOf {
        branch 'main'
        not { changeRequest() }
    }
}
```

## Running Jenkins Locally

```bash
# Minimal Jenkins with Docker support
docker run -d \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Official Docs

- [Declarative pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Using Docker with pipeline](https://www.jenkins.io/doc/book/pipeline/docker/)
- [Pipeline steps reference](https://www.jenkins.io/doc/pipeline/steps/)
