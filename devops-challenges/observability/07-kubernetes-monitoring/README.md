# Exercise 07 — Kubernetes Monitoring

Fix ServiceMonitor and Prometheus Operator manifests so metrics are scraped from an application in Kubernetes.

## Quick Start

```bash
# Requires Prometheus Operator installed (e.g. kube-prometheus-stack)
kubectl apply -f starter/
kubectl get servicemonitor -n monitoring
```

## Files

```
starter/
  service.yaml         — Kubernetes Service
  servicemonitor.yaml  — ServiceMonitor CRD (5 bugs)
solutions/
  service.yaml
  servicemonitor.yaml
  step-by-step-solution.md
```
