#!/bin/bash
set -euo pipefail

VPC_ID="vpc-12345678"
REGION="us-east-1"

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name devops-web-sg \
  --description "Web server security group" \
  --vpc-id "$VPC_ID" \
  --region "$REGION" \
  --query GroupId --output text)

echo "Created security group: $SG_ID"

# Allow SSH
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 2222 \          # BUG 2: SSH is port 22, not 2222
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Allow HTTP — BUG 3: overly permissive (all protocol, all ports)
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol all \
  --port -1 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image ami-0c55b159cbfafe1f0 \    # BUG 1: wrong flag, should be --image-id
  --instance-type t3.micro \
  --security-group-ids "$SG_ID" \
  --instance-profile MyEC2Role \    # BUG 4: wrong flag, should be --iam-instance-profile Name=MyEC2Role
  --user-data "#!/bin/bash
apt-get update -y" \                # BUG 5: must use file:// path, not inline string
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=devops-web}]" \
  --region "$REGION" \
  --query 'Instances[0].InstanceId' --output text)

echo "Launched instance: $INSTANCE_ID"
