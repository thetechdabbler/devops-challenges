# Challenge — Lambda and API Gateway

## Scenario

Your team deploys a Python Lambda function behind API Gateway. A colleague wrote the Lambda function code and CloudFormation template but got the handler name wrong, used the wrong runtime string, forgot the Lambda permission for API Gateway to invoke it, and broke the API Gateway integration type.

Fix the template and function so the API Gateway can trigger Lambda successfully.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong Lambda runtime** — `python3.9` should be `python3.12` (3.9 is deprecated/EOL)
2. **Wrong handler format** — `Handler: lambda_function.handler` is correct format but the starter has `Handler: main.handler` while the file is named `lambda_function.py`
3. **Missing Lambda permission for API Gateway** — without `AWS::Lambda::Permission` allowing `apigateway.amazonaws.com` to invoke the function, API Gateway calls are blocked
4. **Wrong API Gateway integration type** — `Type: HTTP` should be `Type: AWS_PROXY` for Lambda proxy integration
5. **Lambda `MemorySize` too low** — `MemorySize: 64` is below the minimum of 128 MB and will be rejected

## Acceptance Criteria

- [ ] Runtime is `python3.12`
- [ ] Handler matches `lambda_function.handler`
- [ ] `AWS::Lambda::Permission` resource grants API Gateway invoke permission
- [ ] API Gateway integration type is `AWS_PROXY`
- [ ] `MemorySize` is at least 128

## Learning Notes

**Lambda + API Gateway CloudFormation:**
```yaml
MyFunction:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: python3.12
    Handler: lambda_function.handler
    MemorySize: 128
    Timeout: 30
    Role: !GetAtt LambdaRole.Arn

ApiGwPermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !GetAtt MyFunction.Arn
    Action: lambda:InvokeFunction
    Principal: apigateway.amazonaws.com
    SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${MyApi}/*/*"
```
