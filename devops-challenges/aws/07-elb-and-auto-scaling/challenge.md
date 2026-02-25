# Challenge — ELB and Auto Scaling

## Scenario

Your team runs a web application behind an Application Load Balancer with an Auto Scaling Group. A colleague configured the ALB listener and ASG but got the health check path wrong, used the wrong target group protocol, left the ASG with no scaling policy attached, and broke the listener port.

Fix the CloudFormation template so traffic routes to healthy instances and the ASG scales on CPU.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **ALB listener port wrong** — `Port: 443` with no SSL certificate configured will fail; use `Port: 80` for HTTP
2. **Target group health check path wrong** — `HealthCheckPath: /health-check` should be `/health` (matching the app's endpoint)
3. **Target group protocol wrong** — `Protocol: TCP` is for Network Load Balancers; Application Load Balancer targets use `HTTP`
4. **ASG `HealthCheckType` wrong** — `HealthCheckType: EC2` only checks if the instance is running; use `ELB` so the ASG replaces instances that fail ALB health checks
5. **Missing `ScalingPolicy`** — the ASG has no scaling policy attached, so it never scales out or in

## Acceptance Criteria

- [ ] ALB listener is on port 80 (HTTP)
- [ ] Health check path is `/health`
- [ ] Target group uses `HTTP` protocol
- [ ] ASG `HealthCheckType: ELB`
- [ ] A `TargetTrackingScaling` policy is attached

## Learning Notes

**ALB + ASG CloudFormation pattern:**
```yaml
ALBListener:
  Type: AWS::ElasticLoadBalancingV2::Listener
  Properties:
    LoadBalancerArn: !Ref ALB
    Port: 80
    Protocol: HTTP
    DefaultActions:
      - Type: forward
        TargetGroupArn: !Ref TargetGroup

TargetGroup:
  Type: AWS::ElasticLoadBalancingV2::TargetGroup
  Properties:
    Protocol: HTTP
    Port: 80
    HealthCheckPath: /health
    HealthCheckProtocol: HTTP

ASG:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    HealthCheckType: ELB
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
      TargetValue: 60
```
