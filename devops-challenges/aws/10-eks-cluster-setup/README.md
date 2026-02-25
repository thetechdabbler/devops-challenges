# Exercise 10 — EKS Cluster Setup

Fix an eksctl cluster config and setup script to provision an EKS cluster and configure `kubectl` access.

## Quick Start

```bash
# Validate config
eksctl create cluster --config-file starter/cluster.yml --dry-run

# Setup kubectl
bash starter/setup-kubectl.sh
```

## Files

```
starter/
  cluster.yml          — eksctl cluster config (4 bugs)
  setup-kubectl.sh     — kubectl config script (1 bug)
solutions/
  cluster.yml
  setup-kubectl.sh
  step-by-step-solution.md
```
