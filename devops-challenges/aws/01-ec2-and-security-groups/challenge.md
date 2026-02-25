# Challenge — EC2 and Security Groups

## Scenario

Your team provisions an EC2 instance with a security group using the AWS CLI. A colleague wrote a shell script to create the instance but got the AMI ID flag wrong, used the wrong instance profile argument, left the security group with an overly permissive rule, and broke the user data encoding.

Fix the script so the instance launches correctly and the security group follows least-privilege.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong flag for AMI** — `--image` should be `--image-id`
2. **Wrong security group ingress port** — SSH should be port `22`, not `2222`
3. **Security group allows all traffic on all ports** — `--protocol all --port -1` from `0.0.0.0/0` for the HTTP rule should be restricted to `--protocol tcp --port 80`
4. **Wrong instance profile flag** — `--instance-profile` should be `--iam-instance-profile Name=MyRole`
5. **User data not base64 encoded** — `--user-data "#!/bin/bash\napt-get update"` must use `file://` or `base64` encoding for the CLI

## Acceptance Criteria

- [ ] `aws ec2 run-instances` uses `--image-id`
- [ ] SSH security group rule allows port 22 only
- [ ] HTTP rule is `tcp/80`, not all traffic
- [ ] IAM instance profile uses `--iam-instance-profile Name=...`
- [ ] User data passed via `file://userdata.sh`

## Learning Notes

**Launch an EC2 instance:**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-key \
  --security-group-ids sg-12345 \
  --iam-instance-profile Name=EC2InstanceRole \
  --user-data file://userdata.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=devops-web}]'
```

**Security group rules:**
```bash
# Allow SSH from your IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345 \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/32

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345 \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```
