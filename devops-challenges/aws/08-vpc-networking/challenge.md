# Challenge — VPC Networking

## Scenario

Your team provisions a VPC with public and private subnets, an internet gateway, and a NAT gateway. A colleague wrote the CloudFormation template but got the route table associations wrong, forgot to attach the internet gateway to the VPC, and broke the NAT gateway subnet placement.

Fix the template so public subnets reach the internet and private subnets route outbound traffic through the NAT gateway.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Internet Gateway not attached to VPC** — `AWS::EC2::VPCGatewayAttachment` resource is missing
2. **Public route table missing internet gateway route** — the route `0.0.0.0/0` pointing to the IGW is missing from the public route table
3. **NAT gateway placed in private subnet** — NAT gateway must be in a **public** subnet, not private
4. **Private route table routes through IGW instead of NAT** — private subnets should route `0.0.0.0/0` through the NAT gateway, not the internet gateway
5. **Subnet CIDR overlap** — `PublicSubnet1: 10.0.0.0/24` and `PrivateSubnet1: 10.0.0.0/24` use the same CIDR block, which is invalid

## Acceptance Criteria

- [ ] IGW attached to VPC via `VPCGatewayAttachment`
- [ ] Public route table has `0.0.0.0/0 → IGW`
- [ ] NAT Gateway is in a public subnet
- [ ] Private route table has `0.0.0.0/0 → NAT`
- [ ] All subnet CIDRs are unique and non-overlapping

## Learning Notes

**VPC network design:**
```
VPC: 10.0.0.0/16
  Public subnets:   10.0.1.0/24, 10.0.2.0/24  → Internet Gateway
  Private subnets:  10.0.10.0/24, 10.0.11.0/24 → NAT Gateway

Flow:
  Private instance → NAT GW (public subnet) → Internet Gateway → Internet
```

**Key resources:**
- `AWS::EC2::VPCGatewayAttachment` — attaches IGW to VPC
- `AWS::EC2::Route` — adds default route to route table
- `AWS::EC2::SubnetRouteTableAssociation` — links subnet to route table
