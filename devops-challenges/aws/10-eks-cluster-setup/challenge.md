# Challenge — EKS Cluster Setup

## Scenario

Your team provisions an EKS cluster using `eksctl` and then configures `kubectl` to connect to it. A colleague wrote the cluster config and `kubeconfig` update command, but got the Kubernetes version wrong, used the wrong managed node group AMI type, forgot to set the minimum node count, and broke the `aws eks update-kubeconfig` command.

Fix the `eksctl` cluster config and setup script so the cluster provisions successfully and `kubectl` can connect.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Kubernetes version too old** — `version: "1.27"` is EOL; use `"1.31"` (current stable)
2. **AMI type wrong** — `amiType: AL2_x86_64_GPU` is for GPU workloads; standard nodes use `AL2_x86_64`
3. **`minSize` missing** — the managed node group has no `minSize`, which defaults to 0 — set it to `1`
4. **`aws eks update-kubeconfig` missing `--region`** — without `--region`, the command fails if the default region doesn't match
5. **`nodeRole` ARN format wrong** — the IAM role ARN for node groups must be a full ARN: `arn:aws:iam::123456789012:role/NodeRole`, not just `NodeRole`

## Acceptance Criteria

- [ ] Kubernetes version is `1.31` or current stable
- [ ] `amiType: AL2_x86_64` for standard x86 nodes
- [ ] `minSize: 1` in managed node group
- [ ] `update-kubeconfig` includes `--region`
- [ ] `nodeRole` is a full ARN

## Learning Notes

**eksctl cluster config:**
```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: devops-cluster
  region: us-east-1
  version: "1.31"

managedNodeGroups:
  - name: ng-1
    instanceType: t3.medium
    minSize: 1
    maxSize: 5
    desiredCapacity: 2
    amiType: AL2_x86_64
```

**Connect kubectl:**
```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name devops-cluster

kubectl get nodes
```
