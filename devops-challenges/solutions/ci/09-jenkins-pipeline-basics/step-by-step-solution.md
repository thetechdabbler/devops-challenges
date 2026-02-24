# Solution — Jenkins Pipeline Basics

## Fixes Applied

### Fix 1: Docker agent

```groovy
agent {
    docker {
        image 'python:3.11-slim'
    }
}
```

`agent any` runs on whichever Jenkins node is available — no guarantee it has Python 3.11. The Docker agent pulls the exact image and runs all stages inside that container. Reproducible, isolated, no host pollution.

### Fix 2: Virtualenv

```groovy
sh '''
    python -m venv .venv
    . .venv/bin/activate
    pip install -r requirements.txt pytest
'''
```

Even inside a Docker container, using a virtualenv is good practice — it makes `pip list` output clean and prevents accidental system-wide installs. Activate the venv in each stage that needs packages.

### Fix 3: Correct JUnit glob

```groovy
junit 'test-results.xml'
```

`pytest --junitxml=test-results.xml` writes to `test-results.xml` in the workspace root. The starter used `**/junit-*.xml` which doesn't match. Always test the glob against your actual output file.

### Fix 4: Timeout 15 minutes

```groovy
options {
    timeout(time: 15, unit: 'MINUTES')
}
```

A 10-hour timeout means a hung test would hold a Jenkins executor for most of the day. For a unit test suite that normally runs in 2 minutes, 15 minutes is a generous safety net.

### Fix 5: when branch 'main'

```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
```

Without `when`, the deploy stage runs on every branch and every PR build — deploying feature branches to production. `when { branch 'main' }` skips the stage on all other branches.
