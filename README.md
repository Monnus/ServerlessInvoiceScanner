# Serverless Invoice Scanner
A Serverless Invoice Scanner built using AWS cloud services and a React front-end, designed to analyze uploaded invoices and extract key data using Amazon Textract. The extracted data is stored in DynamoDB and can be viewed via a front-end React app connected to an API Gateway.

## Project Architecture
Frontend: ReactJS
Allows users to upload invoices and view extracted data.
Backend: AWS Lambda, API Gateway, DynamoDB, S3, and Textract
Fully serverless architecture for scalability and ease of management.<br/>
AWS Services Used<br/>
Amazon S3<br/>

Used to store uploaded invoices in a dedicated bucket (public-invoice-scanner-bucketc3330-dev).
AWS Lambda

** Two Lambda functions were implemented: ** 
Textract Lambda Function (Back-end Processing):
Triggered by an S3 event.
Uses Amazon Textract to analyze invoices and extract key-value pairs and table data.
Saves the extracted data to DynamoDB.
Deletes previous entries from DynamoDB before adding the latest result to ensure only the most recent entry is available.
DynamoDB Fetch Lambda Function (API Response):
Provides the most recent invoice data stored in DynamoDB via an API Gateway GET request.
Includes optimized data formatting for better front-end display.
Amazon DynamoDB

Stores extracted invoice data (e.g., key-value pairs and tables).
Each record includes metadata such as upload date and the extracted information.
Amazon Textract

Performs OCR (Optical Character Recognition) on invoices to extract structured data, including tables and key-value pairs.
API Gateway

Connects the front-end React application to the DynamoDB Fetch Lambda function.
Configured with CORS support for secure cross-origin requests.
Features
Invoice Upload:

Users can upload PDF invoices via the front-end.
Files are stored in the S3 bucket and trigger the Textract Lambda function.
Data Extraction:

Textract extracts key information from the invoice, such as Invoice Number, Issue Date, Due Date, and detailed table data.
Data Storage:

The extracted information is stored in DynamoDB with the most recent entry available for the user.
Data Retrieval:

The React front-end fetches and displays the extracted data using the API Gateway and DynamoDB Fetch Lambda function.
React Front-end
Built with ReactJS for an intuitive and user-friendly interface.
Users can:
Upload an invoice to S3.
View the extracted data in a well-formatted JSON summary.
Clear the view with a button click for a fresh experience.
Key Components:
FileUpload Component:
Allows users to upload files to S3.
Displays a progress indicator during the upload process.
ViewData Component:
Fetches the latest extracted invoice data from the API Gateway.
Displays data in a clean and readable format, with a Clear Data button.
How It Works
Upload:
The user uploads an invoice (PDF) through the front-end.
Trigger:
The upload triggers the Textract Lambda function.
Textract extracts key data from the invoice.
Store:
The extracted data is stored in DynamoDB.
Previous entries are cleared to keep only the most recent data.
Fetch and Display:
The front-end fetches the most recent entry from DynamoDB and displays it to the user.
Example Data Display
json
Copy
Edit
```
{
  "Invoice ID": "public/invoice.pdf",
  "Upload Date": "2025-02-07T17:57:08.789Z",
  "Key-Value Pairs": {
    "Invoice #": "1001",
    "Issued": "11/9/2024",
    "Due": "12/9/2024",
    "Subtotal": "$4,000.00",
    "Tax": "$0.00",
    "Balance Due": "$4,000.00"
  },
  "Table Data": [
    ["Item Description", "Price", "Quantity", "Tax", "Total"],
    ["Consulting Services", "$150.00", "10", "$0.00", "$1,500.00"],
    ["Software Development", "$100.00", "20", "$0.00", "$2,000.00"]
  ]
}
```
