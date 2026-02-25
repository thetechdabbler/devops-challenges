# Resources — Lambda and API Gateway

## Lambda Runtimes (current)

| Runtime | Identifier |
|---------|-----------|
| Python 3.12 | `python3.12` |
| Python 3.11 | `python3.11` |
| Node.js 20 | `nodejs20.x` |
| Java 21 | `java21` |
| Go 1.x | `provided.al2023` |

## Lambda Handler Format

```
filename.function_name
# e.g. lambda_function.handler → file: lambda_function.py, function: handler
```

## API Gateway Integration Types

| Type | Use case |
|------|---------|
| `AWS_PROXY` | Lambda proxy — passes full request to Lambda |
| `AWS` | Lambda custom integration — transform request/response |
| `HTTP_PROXY` | Proxy to HTTP backend |
| `MOCK` | Return fixed response |

## CloudFormation Snippets

```yaml
# Lambda Permission
ApiGwPermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !GetAtt MyFunction.Arn
    Action: lambda:InvokeFunction
    Principal: apigateway.amazonaws.com
    SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${MyApi}/*/*"

# API Gateway V1 Integration
MyIntegration:
  Type: AWS::ApiGateway::Method
  Properties:
    Integration:
      Type: AWS_PROXY
      IntegrationHttpMethod: POST
      Uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${MyFunction.Arn}/invocations"
```

## Official Docs

- [Lambda developer guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [API Gateway integration types](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html)
- [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
