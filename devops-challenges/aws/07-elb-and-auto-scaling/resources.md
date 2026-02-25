# Resources — ELB and Auto Scaling

## ALB Components

```yaml
# Application Load Balancer
ALB:
  Type: AWS::ElasticLoadBalancingV2::LoadBalancer
  Properties:
    Type: application
    Scheme: internet-facing
    Subnets: [!Ref Subnet1, !Ref Subnet2]

# Target Group
TargetGroup:
  Type: AWS::ElasticLoadBalancingV2::TargetGroup
  Properties:
    Protocol: HTTP          # HTTP or HTTPS (not TCP)
    Port: 80
    VpcId: !Ref VPC
    HealthCheckPath: /health
    HealthCheckProtocol: HTTP
    HealthyThresholdCount: 2
    UnhealthyThresholdCount: 3

# HTTP Listener
Listener:
  Type: AWS::ElasticLoadBalancingV2::Listener
  Properties:
    LoadBalancerArn: !Ref ALB
    Port: 80
    Protocol: HTTP
    DefaultActions:
      - Type: forward
        TargetGroupArn: !Ref TargetGroup
```

## Auto Scaling

```yaml
ASG:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 1
    MaxSize: 10
    DesiredCapacity: 2
    HealthCheckType: ELB       # replaces unhealthy instances
    HealthCheckGracePeriod: 300
    TargetGroupARNs:
      - !Ref TargetGroup

ScalingPolicy:
  Type: AWS::AutoScaling::ScalingPolicy
  Properties:
    AutoScalingGroupName: !Ref ASG
    PolicyType: TargetTrackingScaling
    TargetTrackingConfiguration:
      PredefinedMetricSpecification:
        PredefinedMetricType: ASGAverageCPUUtilization
      TargetValue: 60.0
```

## Official Docs

- [ALB CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-loadbalancer.html)
- [Auto Scaling groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html)
- [Target tracking scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html)
