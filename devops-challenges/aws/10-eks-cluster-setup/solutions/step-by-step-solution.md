# Step-by-Step Solution — EKS Cluster Setup

## Bug 1 — Kubernetes version 1.27 is EOL

AWS EKS ends support for Kubernetes versions ~14 months after the upstream release. Version 1.27 is past end-of-support. Use the current supported version (1.31 as of 2025).

```yaml
version: "1.31"
```

## Bug 2 — GPU AMI type for standard workloads

`AL2_x86_64_GPU` installs NVIDIA drivers and GPU tooling. This is wasteful and may cause boot failures on non-GPU instance types. Use `AL2_x86_64` for standard x86 instances.

```yaml
amiType: AL2_x86_64
```

## Bug 3 — Missing `minSize`

Without `minSize`, the node group can scale to zero. During cluster upgrades or spot interruptions, you could be left with no nodes. Set `minSize: 1`.

```yaml
minSize: 1
```

## Bug 4 — `update-kubeconfig` missing `--region`

The AWS CLI uses the configured default region, which may not match the cluster's region. Always specify `--region` explicitly.

```bash
aws eks update-kubeconfig --region us-east-1 --name devops-cluster
```

## Bug 5 — `instanceRoleARN` is just a name, not an ARN

IAM role ARNs follow the format `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`. Providing just `NodeRole` will cause eksctl to fail with an invalid ARN error.

```yaml
instanceRoleARN: "arn:aws:iam::123456789012:role/NodeRole"
```

## Verify

```bash
eksctl create cluster --config-file solutions/cluster.yml
kubectl get nodes
kubectl get pods --all-namespaces
```

## Cleanup

```bash
eksctl delete cluster --config-file solutions/cluster.yml
```
