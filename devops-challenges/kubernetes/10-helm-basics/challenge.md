# Challenge — Helm Basics

## Scenario

Your team has been copying and editing raw YAML manifests for every environment (dev, staging, prod). Small differences between environments (image tags, replica counts, resource limits) keep causing bugs. You need a templating solution that lets you share one set of manifests with per-environment overrides.

---

## Problems to Fix

The starter Helm chart has **five** issues:

1. `Chart.yaml` is missing `apiVersion: v2` — required for Helm 3 charts
2. `values.yaml` has `replicaCount: 0` — should default to 1
3. The `deployment.yaml` template uses `{{ .Values.image }}` instead of `{{ .Values.image.repository }}:{{ .Values.image.tag }}`
4. The `service.yaml` template hardcodes `type: ClusterIP` instead of referencing `{{ .Values.service.type }}`
5. The `_helpers.tpl` partial for the app name truncates at 32 characters — Kubernetes labels have a 63-character limit; should be 63

---

## Tasks

1. Fix all five issues in the chart
2. Install the chart with default values: `helm install devops-app ./chart`
3. Upgrade with a custom values file for production: `helm upgrade devops-app ./chart -f values-prod.yaml`
4. List releases: `helm list`
5. Inspect rendered templates without installing: `helm template devops-app ./chart`
6. Uninstall: `helm uninstall devops-app`

---

## Acceptance Criteria

- [ ] `helm lint ./chart` passes with no errors
- [ ] `helm install devops-app ./chart --dry-run` shows valid YAML
- [ ] `helm list` shows the release as `deployed`
- [ ] `helm upgrade` with `values-prod.yaml` increases replicas to 3
- [ ] `helm rollback devops-app 1` returns to the previous version

---

## Learning Notes

### Helm chart structure

```
chart/
├── Chart.yaml          # chart metadata
├── values.yaml         # default values
├── values-prod.yaml    # production overrides (not in chart, applied with -f)
└── templates/
    ├── _helpers.tpl    # template helpers (named templates)
    ├── deployment.yaml
    ├── service.yaml
    └── configmap.yaml
```

### Template syntax

```yaml
# values.yaml
replicaCount: 1
image:
  repository: devops-app
  tag: "1.0.0"

# templates/deployment.yaml
replicas: {{ .Values.replicaCount }}
image: {{ .Values.image.repository }}:{{ .Values.image.tag }}

# Conditionals
{{- if .Values.ingress.enabled }}
# ingress manifest
{{- end }}

# Range (loop)
{{- range .Values.env }}
- name: {{ .name }}
  value: {{ .value | quote }}
{{- end }}
```

### Essential Helm commands

```bash
helm install <release> <chart>           # install
helm upgrade <release> <chart>           # upgrade
helm upgrade --install <release> <chart> # install or upgrade
helm list                                # list releases
helm status <release>                    # release details
helm rollback <release> <revision>       # rollback
helm uninstall <release>                 # delete
helm template <release> <chart>          # render without installing
helm lint <chart>                        # validate chart
helm get values <release>                # show applied values
```
