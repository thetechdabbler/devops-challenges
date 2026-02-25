# Resources — RDS and Secrets Manager

## RDS CloudFormation

```yaml
MyDB:
  Type: AWS::RDS::DBInstance
  Properties:
    Engine: postgres
    EngineVersion: "15.4"
    DBInstanceClass: db.t3.micro
    AllocatedStorage: "20"
    MasterUsername: admin
    MasterUserPassword: !Sub "{{resolve:secretsmanager:${MySecret}:SecretString:password}}"
    PubliclyAccessible: false
    VPCSecurityGroups:
      - !Ref DBSecurityGroup
    DBSubnetGroupName: !Ref DBSubnetGroup
    BackupRetentionPeriod: 7
    DeletionPolicy: Snapshot
```

## Secrets Manager CLI

```bash
# Store secret
aws secretsmanager create-secret \
  --name prod/db/password \
  --secret-string '{"username":"admin","password":"SuperSecret123!"}'

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id prod/db/password \
  --query SecretString \
  --output text | jq -r .password

# Rotate secret
aws secretsmanager rotate-secret \
  --secret-id prod/db/password \
  --rotation-lambda-arn arn:aws:lambda:...
```

## RDS Parameter Group Families

| Engine | Version | Family |
|--------|---------|--------|
| PostgreSQL | 15.x | postgres15 |
| PostgreSQL | 14.x | postgres14 |
| MySQL | 8.0.x | mysql8.0 |

## Official Docs

- [RDS CloudFormation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html)
- [Secrets Manager CLI](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/)
- [RDS engine versions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
