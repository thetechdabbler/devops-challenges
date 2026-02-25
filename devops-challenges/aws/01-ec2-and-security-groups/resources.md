# Resources — EC2 and Security Groups

## EC2 Launch

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --count 1 \
  --key-name my-key \
  --security-group-ids sg-xxxx \
  --subnet-id subnet-xxxx \
  --iam-instance-profile Name=MyRole \
  --user-data file://userdata.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web}]'
```

## Security Group Management

```bash
# Create SG
SG_ID=$(aws ec2 create-security-group \
  --group-name devops-sg \
  --description "DevOps web server" \
  --vpc-id vpc-xxxx \
  --query GroupId --output text)

# Allow SSH (restrict to your IP in production)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
```

## Useful Commands

```bash
# Get instance public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=devops-web" \
  --query 'Reservations[].Instances[].PublicIpAddress' \
  --output text

# Terminate instance
aws ec2 terminate-instances --instance-ids i-xxxx
```

## Official Docs

- [run-instances CLI](https://docs.aws.amazon.com/cli/latest/reference/ec2/run-instances.html)
- [Security group rules](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules.html)
- [EC2 user data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html)
