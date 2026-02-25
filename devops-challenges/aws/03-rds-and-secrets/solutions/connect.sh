#!/bin/bash
set -euo pipefail

SECRET_ID="prod/db/password"

# FIX 4 & 5: correct command + parse JSON
PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --query SecretString \
  --output text | jq -r .password)

DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier devops-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

PGPASSWORD="$PASSWORD" psql \
  --host "$DB_HOST" \
  --user admin \
  --dbname postgres
