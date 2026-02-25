# Challenge — RDS and Secrets Manager

## Scenario

Your team provisions an RDS PostgreSQL instance and stores credentials in AWS Secrets Manager. A colleague wrote the CloudFormation template and a helper script, but got the RDS engine version wrong, used the wrong Secrets Manager CLI command to retrieve the secret, left the RDS instance publicly accessible, and broke the parameter group family.

Fix the template and script so the database is private and credentials are retrieved correctly.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong RDS engine name** — `Engine: postgres` is correct but `EngineVersion: "15"` needs the patch version — use `"15.4"`
2. **RDS instance is publicly accessible** — `PubliclyAccessible: true` should be `false` for production databases
3. **Wrong parameter group family** — `DBParameterGroupFamily: postgres14` should match the engine version `postgres15`
4. **Wrong Secrets Manager CLI command** — `aws secretsmanager get-secret` should be `aws secretsmanager get-secret-value`
5. **Secret value not parsed from JSON** — the secret is stored as JSON; the password is at `.password` field but the script uses the raw output without `| jq -r .password`

## Acceptance Criteria

- [ ] RDS `EngineVersion` is `"15.4"` (or current patch)
- [ ] `PubliclyAccessible: false`
- [ ] Parameter group family is `postgres15`
- [ ] Secret retrieved with `get-secret-value`
- [ ] Script parses `.password` from JSON secret value

## Learning Notes

**CloudFormation RDS snippet:**
```yaml
MyDB:
  Type: AWS::RDS::DBInstance
  Properties:
    Engine: postgres
    EngineVersion: "15.4"
    DBInstanceClass: db.t3.micro
    AllocatedStorage: 20
    PubliclyAccessible: false
    DBParameterGroupName: !Ref MyParamGroup

MyParamGroup:
  Type: AWS::RDS::DBParameterGroup
  Properties:
    DBParameterGroupFamily: postgres15
    Description: Postgres 15 params
```

**Retrieve secret:**
```bash
PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id prod/db/password \
  --query SecretString \
  --output text | jq -r .password)
```
