# Step-by-Step Solution — Lambda and API Gateway

## Bug 1 — Deprecated runtime `python3.9`

Python 3.9 is EOL for Lambda. Use `python3.12` (or `python3.11`).

```yaml
Runtime: python3.12
```

## Bug 2 — Handler `main.handler` doesn't match file name

The Lambda handler is `filename.function_name`. The file is `lambda_function.py` so the handler must be `lambda_function.handler`.

```yaml
Handler: lambda_function.handler
```

## Bug 3 — Missing `AWS::Lambda::Permission`

API Gateway needs explicit permission to invoke the Lambda function. Without it, all requests return HTTP 403.

```yaml
ApiGwPermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !GetAtt MyFunction.Arn
    Action: lambda:InvokeFunction
    Principal: apigateway.amazonaws.com
    SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${MyApi}/*/*"
```

## Bug 4 — Integration type `HTTP` instead of `AWS_PROXY`

`HTTP` proxies to an HTTP backend, not a Lambda function. For Lambda, use `AWS_PROXY` which passes the full request event to the handler.

```yaml
Type: AWS_PROXY
```

## Bug 5 — `MemorySize: 64` below minimum

Lambda's minimum memory allocation is 128 MB. Values below this are rejected by the API.

```yaml
MemorySize: 128
```

## Verify

```bash
aws cloudformation deploy --template-file solutions/template.yml --stack-name devops-lambda \
  --capabilities CAPABILITY_IAM
# Test the endpoint
API_URL=$(aws cloudformation describe-stacks --stack-name devops-lambda \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)
curl $API_URL/hello
```
