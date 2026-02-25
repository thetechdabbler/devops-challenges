# Resources — EKS Cluster Setup

## eksctl Cluster Config

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: devops-cluster
  region: us-east-1
  version: "1.31"

iam:
  withOIDC: true    # enables IRSA (IAM Roles for Service Accounts)

managedNodeGroups:
  - name: ng-standard
    instanceType: t3.medium
    minSize: 1
    maxSize: 10
    desiredCapacity: 3
    amiType: AL2_x86_64     # standard x86; use AL2_ARM_64 for Graviton
    labels:
      role: worker
    tags:
      Environment: prod
```

## AMI Types

| AMI Type | Use case |
|----------|---------|
| `AL2_x86_64` | Standard x86 nodes (Amazon Linux 2) |
| `AL2_ARM_64` | Graviton (ARM) nodes |
| `AL2_x86_64_GPU` | GPU nodes |
| `BOTTLEROCKET_x86_64` | Bottlerocket OS |

## kubectl Configuration

```bash
# Add cluster to kubeconfig
aws eks update-kubeconfig \
  --region us-east-1 \
  --name devops-cluster \
  --kubeconfig ~/.kube/config

# Verify
kubectl get nodes
kubectl get pods --all-namespaces
```

## Official Docs

- [EKS getting started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)
- [eksctl documentation](https://eksctl.io/usage/creating-and-managing-clusters/)
- [EKS best practices](https://aws.github.io/aws-eks-best-practices/)
