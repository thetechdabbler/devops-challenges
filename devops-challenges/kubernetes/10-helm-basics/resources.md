# Resources — Helm Basics

## Essential Helm Commands

```bash
# Install / upgrade
helm install <release> <chart>
helm upgrade <release> <chart>
helm upgrade --install <release> <chart>   # idempotent

# Override values
helm install <release> <chart> --set replicaCount=3
helm install <release> <chart> -f values-prod.yaml

# Inspect
helm list
helm status <release>
helm get values <release>       # what values are applied
helm get manifest <release>     # rendered YAML in cluster

# Render without installing
helm template <release> <chart>
helm template <release> <chart> -f values-prod.yaml

# Validate
helm lint <chart>

# Rollback
helm rollback <release> <revision>
helm history <release>

# Cleanup
helm uninstall <release>
```

## Chart Structure

```
chart/
├── Chart.yaml           # chart metadata (required)
├── values.yaml          # default values
└── templates/
    ├── _helpers.tpl     # named templates (not rendered directly)
    ├── deployment.yaml
    ├── service.yaml
    └── NOTES.txt        # post-install instructions
```

## Template Syntax Quick Reference

```yaml
# Value reference
{{ .Values.replicaCount }}
{{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}

# Quoted strings
{{ .Values.service.type | quote }}

# Conditional
{{- if .Values.ingress.enabled }}
# ... ingress manifest
{{- end }}

# Default value
{{ .Values.replicas | default 1 }}

# Named template (from _helpers.tpl)
{{ include "mychart.fullname" . }}

# Release metadata
{{ .Release.Name }}
{{ .Release.Namespace }}
{{ .Chart.Version }}
```

## Chart.yaml Fields

```yaml
apiVersion: v2        # v1 for Helm 2, v2 for Helm 3 (required)
name: devops-app
description: A Helm chart for the DevOps Teacher sample app
type: application     # application | library
version: 0.1.0        # chart version (SemVer)
appVersion: "1.0.0"   # app version (informational)
```

## Official Docs

- [Helm docs](https://helm.sh/docs/)
- [Chart best practices](https://helm.sh/docs/chart_best_practices/)
- [Built-in objects](https://helm.sh/docs/chart_template_guide/builtin_objects/)
