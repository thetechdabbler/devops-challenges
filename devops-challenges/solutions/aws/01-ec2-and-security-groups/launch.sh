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

# Allow SSH — FIX 2: correct port 22
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Allow HTTP — FIX 3: restrict to tcp/80 only
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \         # FIX 1: correct flag
  --instance-type t3.micro \
  --security-group-ids "$SG_ID" \
  --iam-instance-profile Name=MyEC2Role \    # FIX 4: correct flag and format
  --user-data file://userdata.sh \           # FIX 5: file:// reference
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=devops-web}]" \
  --region "$REGION" \
  --query 'Instances[0].InstanceId' --output text)

echo "Launched instance: $INSTANCE_ID"
