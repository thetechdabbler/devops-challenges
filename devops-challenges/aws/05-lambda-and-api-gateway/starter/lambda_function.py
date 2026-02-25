import json


def handler(event, context):
    """Lambda handler — entry point for API Gateway requests."""
    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "message": "Hello from Lambda!",
            "path": path,
            "method": method,
        }),
    }
