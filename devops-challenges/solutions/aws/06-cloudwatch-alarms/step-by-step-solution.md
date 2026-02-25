# Step-by-Step Solution — CloudWatch Alarms

## Bug 1 — Wrong `ComparisonOperator`

`LessThanOrEqualToThreshold` triggers when CPU is **below** 80%, the opposite of what you want. Use `GreaterThanOrEqualToThreshold`.

```yaml
ComparisonOperator: GreaterThanOrEqualToThreshold
```

## Bug 2 — Wrong namespace `AWS/Compute`

There is no `AWS/Compute` namespace. EC2 metrics are in `AWS/EC2`.

```yaml
Namespace: AWS/EC2
```

## Bug 3 — `EvaluationPeriods: 1` causes flappy alerts

A single data point spike triggers the alarm. Use `EvaluationPeriods: 3` with `DatapointsToAlarm: 2` — meaning 2 out of 3 consecutive periods must breach before the alarm fires.

```yaml
EvaluationPeriods: 3
DatapointsToAlarm: 2
```

## Bug 4 — SNS ARN has trailing colon

SNS ARN format is `arn:aws:sns:region:account-id:topic-name`. The trailing `:` makes it an invalid ARN.

```yaml
# Wrong
"arn:aws:sns:us-east-1:123456789012:alerts:"

# Fixed
"arn:aws:sns:us-east-1:123456789012:alerts"
```

## Bug 5 — `Period: 10` below minimum

CloudWatch's minimum standard resolution period is 60 seconds. Use 60, 300 (5 min), or any multiple of 60.

```yaml
Period: 300
```

## Verify

```bash
aws cloudformation deploy --template-file solutions/alarms.yml \
  --stack-name devops-alarms \
  --parameter-overrides InstanceId=i-xxxx

aws cloudwatch describe-alarms --alarm-names HighCPU
```
