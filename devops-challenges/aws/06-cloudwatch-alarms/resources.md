# Resources — CloudWatch Alarms

## Alarm Configuration

```yaml
Type: AWS::CloudWatch::Alarm
Properties:
  AlarmName: MyAlarm
  MetricName: CPUUtilization
  Namespace: AWS/EC2           # or AWS/ECS, AWS/RDS, etc.
  Dimensions:
    - Name: InstanceId
      Value: i-xxxx
  Statistic: Average           # or Sum, Maximum, Minimum, SampleCount
  Period: 300                  # seconds (min 60)
  EvaluationPeriods: 3
  DatapointsToAlarm: 2         # M of N
  Threshold: 80
  ComparisonOperator: GreaterThanOrEqualToThreshold
  AlarmActions:
    - arn:aws:sns:us-east-1:123456789012:alerts
  OKActions:
    - arn:aws:sns:us-east-1:123456789012:alerts
  TreatMissingData: notBreaching
```

## Common Namespaces

| Namespace | Service |
|-----------|---------|
| `AWS/EC2` | EC2 instances |
| `AWS/ECS` | ECS services |
| `AWS/RDS` | RDS instances |
| `AWS/Lambda` | Lambda functions |
| `AWS/ApplicationELB` | Application Load Balancer |

## ComparisonOperator Values

- `GreaterThanOrEqualToThreshold`
- `GreaterThanThreshold`
- `LessThanOrEqualToThreshold`
- `LessThanThreshold`

## Official Docs

- [CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)
- [CloudFormation alarm reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudwatch-alarm.html)
- [Metric namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/aws-services-cloudwatch-metrics.html)
