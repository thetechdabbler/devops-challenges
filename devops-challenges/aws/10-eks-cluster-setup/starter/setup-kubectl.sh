#!/bin/bash
set -euo pipefail

CLUSTER_NAME="devops-cluster"

# BUG 4: missing --region flag
aws eks update-kubeconfig --name "$CLUSTER_NAME"

echo "kubectl configured for cluster: $CLUSTER_NAME"
kubectl get nodes
