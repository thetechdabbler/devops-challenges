{{/*
BUG 5: trunc 32 should be trunc 63 — Kubernetes label values allow up to 63 chars.
*/}}
{{- define "devops-app.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 32 | trimSuffix "-" }}
{{- end }}

{{- define "devops-app.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "devops-app.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
