# Lambda Functions for Serverless Invoice Scanner

## 1. `extract-lambda.mjs`
- Trigger: S3 Upload
- Purpose: Extract data using Textract and store it in DynamoDB.
### 1.1 `helperExtractLambda.mjs`
- Helper: Helper function to ** extract-lambda.mjs ** 
- Pupose: helps format unstrucrured data retrieved from Trextract

## 2. `GetDynamodbData.mjs`
- Trigger: API Gateway (HTTP GET)
- Purpose: Retrieve the latest invoice data from DynamoDB for the front-end.
### 2.1 `FormatGetDynamodbData.mjs`
- Helper: Helper function to ** GetDynamodbData.mjs ** 
- Pupose: helps format and structure the dynamodb data before sending it to front-end