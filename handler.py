from lambda_decorators import dump_json_body


@dump_json_body
def hello(event, context):
    return {
        "statusCode": 200,
        "body": {
            "message": "Go Serverless v1.0! Your function executed successfully!",
            "input": event,
        },
    }
