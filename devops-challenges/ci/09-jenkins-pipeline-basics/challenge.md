# Challenge — Jenkins Pipeline Basics

## Scenario

Your company uses Jenkins for CI alongside GitHub Actions (some older projects haven't migrated). You need to write a declarative Jenkinsfile that builds, tests, and reports results for the Flask app.

---

## Problems to Fix

The starter `Jenkinsfile` has **five** issues:

1. `agent any` is used without specifying Python — the build will fail if the Jenkins agent doesn't have Python 3.11 installed; use a Docker agent instead
2. The `sh 'pip install'` step runs as the Jenkins user without a virtualenv — packages may conflict with system Python
3. The `post { always { junit } }` step uses a glob that doesn't match the pytest XML output location
4. The `options { timeout }` is set to 10 hours — should be 15 minutes for a unit test suite
5. There is no `when` condition on the deploy stage — it should only run on the `main` branch

---

## Tasks

1. Change the agent to use a Python 3.11 Docker image
2. Use a `venv` in the pipeline steps to isolate packages
3. Fix the JUnit glob to match pytest's XML output (`**/test-results.xml`)
4. Set `timeout(time: 15, unit: 'MINUTES')` in the options block
5. Add a `when { branch 'main' }` condition to the deploy stage

---

## Acceptance Criteria

- [ ] The pipeline appears in Jenkins with three stages: Build, Test, Deploy
- [ ] Tests run in an isolated virtualenv
- [ ] Test results are published in the Jenkins test report UI
- [ ] The Deploy stage is skipped on non-main branches
- [ ] The pipeline times out after 15 minutes if it hangs

---

## Learning Notes

### Declarative Jenkinsfile structure

```groovy
pipeline {
    agent {
        docker {
            image 'python:3.11-slim'
        }
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
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
                always {
                    junit 'test-results.xml'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'echo deploy'
            }
        }
    }

    post {
        failure {
            echo 'Build failed!'
        }
    }
}
```

### Virtualenv in Jenkins

```groovy
steps {
    sh '''
        python -m venv .venv
        . .venv/bin/activate
        pip install -r requirements.txt
        pytest --junitxml=test-results.xml
    '''
}
```

### Docker agent

```groovy
agent {
    docker {
        image 'python:3.11-slim'
        args '-v /tmp:/tmp'   # optional volume mounts
    }
}
```

Each stage can override the agent with its own docker image.
