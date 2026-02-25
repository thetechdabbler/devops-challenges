# Resources — VPC Networking

## VPC Architecture

```
Internet
    |
Internet Gateway (IGW)
    |
Public Subnet (10.0.1.0/24)
    | NAT Gateway
Private Subnet (10.0.10.0/24)
    | instances (no public IP)
```

## CloudFormation VPC Pattern

```yaml
VPC:
  Type: AWS::EC2::VPC
  Properties:
    CidrBlock: 10.0.0.0/16
    EnableDnsSupport: true
    EnableDnsHostnames: true

IGW:
  Type: AWS::EC2::InternetGateway

IGWAttachment:
  Type: AWS::EC2::VPCGatewayAttachment
  Properties:
    VpcId: !Ref VPC
    InternetGatewayId: !Ref IGW

PublicSubnet:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref VPC
    CidrBlock: 10.0.1.0/24
    MapPublicIpOnLaunch: true

PublicRT:
  Type: AWS::EC2::RouteTable
  Properties:
    VpcId: !Ref VPC

PublicRoute:
  Type: AWS::EC2::Route
  DependsOn: IGWAttachment
  Properties:
    RouteTableId: !Ref PublicRT
    DestinationCidrBlock: 0.0.0.0/0
    GatewayId: !Ref IGW   # public → IGW

EIP:
  Type: AWS::EC2::EIP
  Properties:
    Domain: vpc

NATGateway:
  Type: AWS::EC2::NatGateway
  Properties:
    AllocationId: !GetAtt EIP.AllocationId
    SubnetId: !Ref PublicSubnet   # NAT GW must be in public subnet

PrivateRoute:
  Type: AWS::EC2::Route
  Properties:
    RouteTableId: !Ref PrivateRT
    DestinationCidrBlock: 0.0.0.0/0
    NatGatewayId: !Ref NATGateway   # private → NAT GW
```

## Official Docs

- [VPC user guide](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
- [NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
- [Route tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html)
