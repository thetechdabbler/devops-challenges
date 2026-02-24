# Solution — Helm Basics

## Fixes Applied

### Fix 1: apiVersion: v2 in Chart.yaml

```yaml
# Before
name: devops-app
...

# After
apiVersion: v2   # required for Helm 3
name: devops-app
...
```

Helm 2 charts use `apiVersion: v1`. Helm 3 introduced `v2` to distinguish them. `helm lint` fails on missing apiVersion.

### Fix 2: replicaCount: 1

```yaml
# Before
replicaCount: 0   # creates a Deployment with 0 pods

# After
replicaCount: 1
```

### Fix 3: image reference template

```yaml
# Before (broken — .Values.image is a map, not a string)
image: "{{ .Values.image }}"

# After
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

`{{ .Values.image }}` tries to render the entire `image:` map as a string, which produces `map[pullPolicy:IfNotPresent repository:devops-app tag:1.0.0]`.

### Fix 4: service.type from values

```yaml
# Before
type: ClusterIP   # hardcoded

# After
type: {{ .Values.service.type }}   # configurable
```

Hardcoding means the Service type can't be changed for NodePort (dev) or LoadBalancer (cloud prod) without editing the template.

### Fix 5: trunc 63 in _helpers.tpl

```yaml
# Before
| trunc 32 | trimSuffix "-"

# After
| trunc 63 | trimSuffix "-"
```

Kubernetes label values allow up to 63 characters. `trunc 32` silently truncates release names mid-word and can create collisions between similarly-named releases.

---

## Walkthrough

```bash
# Validate
helm lint chart/

# Install (dry run)
helm install devops-app chart/ --dry-run --debug

# Install
helm install devops-app chart/
helm list

# Upgrade with prod values (3 replicas, v1.1.0 image)
helm upgrade devops-app chart/ -f chart/values-prod.yaml
helm get values devops-app   # shows merged values

# History and rollback
helm history devops-app
helm rollback devops-app 1   # back to v1.0.0 config
helm status devops-app

# Cleanup
helm uninstall devops-app
```

---

## Rendered Output (helm template)

```bash
helm template devops-app chart/
helm template devops-app chart/ -f chart/values-prod.yaml | grep replicas
# replicas: 3
```
