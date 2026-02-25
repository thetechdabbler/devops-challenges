#!/bin/bash
set -euo pipefail

CLUSTER_NAME="devops-cluster"
REGION="us-east-1"

# FIX 4: include --region flag
aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"

echo "kubectl configured for cluster: $CLUSTER_NAME"
kubectl get nodes
