# Challenge — CloudWatch Alarms

## Scenario

Your team uses CloudWatch to alert on high CPU usage and error rates. A colleague wrote the CloudWatch alarm CLI commands and a CloudFormation template but got the comparison operator wrong, used the wrong metric namespace, left the evaluation period too short, and broke the SNS ARN format.

Fix the alarms so they fire reliably when thresholds are breached.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong `ComparisonOperator`** — `LessThanOrEqualToThreshold` should be `GreaterThanOrEqualToThreshold` for a high-CPU alarm
2. **Wrong metric namespace** — `AWS/Compute` should be `AWS/EC2` for EC2 CPU metrics
3. **`EvaluationPeriods: 1` too short** — a single data point can be a spike; use `EvaluationPeriods: 3` and `DatapointsToAlarm: 2` for more robust alerting
4. **SNS ARN wrong format** — `arn:aws:sns:us-east-1:123456789012:alerts:` has a trailing colon; SNS ARN format is `arn:aws:sns:region:account:topic-name`
5. **`Period` too low** — `Period: 10` is 10 seconds, below CloudWatch's minimum granularity of 60 seconds

## Acceptance Criteria

- [ ] `ComparisonOperator` is `GreaterThanOrEqualToThreshold`
- [ ] Namespace is `AWS/EC2`
- [ ] `EvaluationPeriods` is at least 3
- [ ] SNS ARN has no trailing colon
- [ ] `Period` is 60 or higher

## Learning Notes

**CloudWatch alarm:**
```yaml
HighCPUAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: HighCPU
    MetricName: CPUUtilization
    Namespace: AWS/EC2
    Dimensions:
      - Name: InstanceId
        Value: !Ref MyInstance
    Statistic: Average
    Period: 300
    EvaluationPeriods: 3
    DatapointsToAlarm: 2
    Threshold: 80
    ComparisonOperator: GreaterThanOrEqualToThreshold
    AlarmActions:
      - !Sub "arn:aws:sns:${AWS::Region}:${AWS::AccountId}:alerts"
    TreatMissingData: notBreaching
```
