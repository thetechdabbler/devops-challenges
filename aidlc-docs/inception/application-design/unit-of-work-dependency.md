# Unit of Work — Dependency Matrix

## Dependency Rules

| Unit | Depends On | Reason |
|------|-----------|--------|
| repo-scaffolding | — | Foundation unit, no dependencies |
| docker | repo-scaffolding | Sample app must exist before containerization exercises |
| kubernetes | repo-scaffolding, docker | K8s exercises deploy the containerized sample app |
| ci | repo-scaffolding | Pipeline exercises build the sample app from shared-resources |
| cd | repo-scaffolding, ci | Deployment exercises extend CI pipelines |
| ansible | repo-scaffolding | Playbooks configure the sample app environment |
| iac | repo-scaffolding | IaC exercises provision infrastructure for the sample app |
| observability | repo-scaffolding | Observability instruments the sample app |
| aws | repo-scaffolding | AWS exercises deploy the sample app to cloud |

## Execution Order

```
repo-scaffolding (FIRST — blocks all others)
       |
       +--- docker
       |       |
       |       +--- kubernetes (docker exercises recommended first)
       |
       +--- ci
       |       |
       |       +--- cd (ci exercises recommended first)
       |
       +--- ansible
       +--- iac
       +--- observability
       +--- aws
```

**Hard dependency**: `repo-scaffolding` must be completed before any topic unit begins (sample app must exist).

**Soft dependency**: `docker` → `kubernetes` and `ci` → `cd` (recommended order for learners, but units can be generated independently).

## Parallelization

After `repo-scaffolding` is complete, all 8 topic units can be **generated independently in any order**.

Recommended generation sequence (based on learning progression):
1. `repo-scaffolding`
2. `docker`
3. `kubernetes`
4. `ci`
5. `cd`
6. `ansible`
7. `iac`
8. `observability`
9. `aws`
