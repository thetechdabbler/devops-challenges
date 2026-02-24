# Resources — Reusable Workflows

## Reusable Workflow Template

```yaml
# .github/workflows/python-ci.yml
name: Python CI (Reusable)

on:
  workflow_call:
    inputs:
      python-version:
        type: string
        default: "3.11"
        required: false
        description: "Python version to test against"
      test-command:
        type: string
        default: "pytest"
        required: false
    secrets:
      API_KEY:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ inputs.python-version }}
          cache: "pip"
      - run: pip install -r requirements.txt pytest
      - run: ${{ inputs.test-command }}
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

## Caller Workflow

```yaml
# .github/workflows/my-service-ci.yml
jobs:
  ci:
    uses: ./.github/workflows/python-ci.yml        # local
    # uses: org/shared/.github/workflows/python-ci.yml@main  # remote
    with:
      python-version: "3.12"
      test-command: "pytest --cov=myservice"
    secrets: inherit   # pass all secrets from calling context
    # OR explicit secrets:
    # secrets:
    #   API_KEY: ${{ secrets.API_KEY }}
```

## Outputs from Reusable Workflows

```yaml
# In reusable workflow
jobs:
  build:
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}
    steps:
      - id: meta
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

on:
  workflow_call:
    outputs:
      image-tag:
        value: ${{ jobs.build.outputs.image-tag }}

# In caller
jobs:
  build:
    uses: ./.github/workflows/build.yml

  deploy:
    needs: build
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.image-tag }}"
```

## Official Docs

- [Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Calling a reusable workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows#calling-a-reusable-workflow)
