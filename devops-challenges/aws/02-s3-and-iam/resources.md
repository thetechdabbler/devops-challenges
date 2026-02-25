# Resources — S3 and IAM

## IAM Role Creation

```bash
# Create role with trust policy
aws iam create-role \
  --role-name EC2S3ReadRole \
  --assume-role-policy-document file://trust-policy.json

# Attach permissions policy
aws iam put-role-policy \
  --role-name EC2S3ReadRole \
  --policy-name S3ReadPolicy \
  --policy-document file://iam-policy.json

# Create instance profile
aws iam create-instance-profile --instance-profile-name EC2S3Profile
aws iam add-role-to-instance-profile \
  --instance-profile-name EC2S3Profile \
  --role-name EC2S3ReadRole
```

## S3 Bucket Setup

```bash
# Create bucket
aws s3api create-bucket --bucket my-artifacts --region us-east-1

# Block all public access
aws s3api put-public-access-block \
  --bucket my-artifacts \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,\
BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket my-artifacts \
  --versioning-configuration Status=Enabled
```

## S3 Actions Reference

| Action | Purpose |
|--------|---------|
| `s3:GetObject` | Download an object |
| `s3:PutObject` | Upload an object |
| `s3:DeleteObject` | Delete an object |
| `s3:ListBucket` | List objects in bucket |

## Official Docs

- [IAM roles for EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
- [S3 bucket policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- [Block public access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
