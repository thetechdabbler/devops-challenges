# Step-by-Step Solution — ELB and Auto Scaling

## Bug 1 — ALB listener on port 443 without certificate

Port 443 requires an SSL/TLS certificate configured on the listener. Without one, CloudFormation fails. For HTTP, use port 80.

```yaml
Port: 80
Protocol: HTTP
```

## Bug 2 — Health check path `/health-check` vs `/health`

The ALB sends health check requests to the specified path. If the app serves `/health` but the target group checks `/health-check`, all instances appear unhealthy and are deregistered.

```yaml
HealthCheckPath: /health
```

## Bug 3 — Target group `Protocol: TCP`

TCP protocol is for Network Load Balancers. Application Load Balancers require `HTTP` or `HTTPS`.

```yaml
Protocol: HTTP
```

## Bug 4 — `HealthCheckType: EC2` only checks instance state

`EC2` health checks only verify the instance is running. `ELB` health checks use the ALB target group health check, so instances that fail HTTP health checks are replaced.

```yaml
HealthCheckType: ELB
```

## Bug 5 — Missing `ScalingPolicy`

Without a scaling policy, the ASG never changes its desired capacity automatically.

```yaml
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

## Verify

```bash
aws cloudformation deploy --template-file solutions/alb-asg.yml \
  --stack-name devops-alb-asg \
  --parameter-overrides VpcId=vpc-xxx SubnetIds=subnet-a,subnet-b AmiId=ami-xxx

ALB_DNS=$(aws cloudformation describe-stacks --stack-name devops-alb-asg \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBDns`].OutputValue' --output text)
curl http://$ALB_DNS/health
```
