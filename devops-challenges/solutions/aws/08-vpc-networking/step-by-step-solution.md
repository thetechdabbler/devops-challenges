# Step-by-Step Solution — VPC Networking

## Bug 1 — Missing `VPCGatewayAttachment`

Creating an Internet Gateway is not enough — it must be explicitly attached to the VPC.

```yaml
IGWAttachment:
  Type: AWS::EC2::VPCGatewayAttachment
  Properties:
    VpcId: !Ref VPC
    InternetGatewayId: !Ref IGW
```

## Bug 2 — Public route table has no internet route

The public route table needs a default route (`0.0.0.0/0`) pointing to the Internet Gateway so instances in public subnets can reach the internet.

```yaml
PublicRoute:
  Type: AWS::EC2::Route
  DependsOn: IGWAttachment
  Properties:
    RouteTableId: !Ref PublicRT
    DestinationCidrBlock: 0.0.0.0/0
    GatewayId: !Ref IGW
```

## Bug 3 — NAT Gateway in private subnet

NAT Gateways must be placed in a **public** subnet so they can route outbound traffic from private subnets through the Internet Gateway.

```yaml
SubnetId: !Ref PublicSubnet1  # must be public
```

## Bug 4 — Private route points to IGW instead of NAT

Private subnets should never route directly to the Internet Gateway. Outbound traffic goes through the NAT Gateway.

```yaml
NatGatewayId: !Ref NATGateway
```

## Bug 5 — CIDR block overlap

`10.0.0.0/24` (private) overlaps with... actually it doesn't overlap with `10.0.1.0/24` (public), but the starter used `10.0.0.0/24` for private, which starts at the same address as the VPC `10.0.0.0/16`. Using distinct blocks avoids confusion.

```yaml
PrivateSubnet1:
  CidrBlock: 10.0.10.0/24  # clearly separate range
```

## Verify

```bash
aws cloudformation deploy --template-file solutions/vpc.yml --stack-name devops-vpc
aws ec2 describe-route-tables --filters "Name=tag:aws:cloudformation:stack-name,Values=devops-vpc"
```
