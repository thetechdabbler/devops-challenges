#!/bin/bash
set -euo pipefail

BUCKET="devops-artifacts"
REGION="us-east-1"

aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"

# BUG 4: public access block not enabled
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    BlockPublicAcls=false,IgnorePublicAcls=false,\
BlockPublicPolicy=false,RestrictPublicBuckets=false

aws iam create-role \
  --role-name EC2S3ReadRole \
  --assume-role-policy-document file://trust-policy.json

aws iam put-role-policy \
  --role-name EC2S3ReadRole \
  --policy-name S3ReadPolicy \
  --policy-document file://iam-policy.json

echo "Setup complete"
