import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import cleanAndFormatData from "./formatInvoiceData.mjs";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Limit: 1,
  };

  try {
    console.log("Fetching data from DynamoDB...");
    const data = await dynamoDBClient.send(new ScanCommand(params));
    
    if (!data.Items || data.Items.length === 0) {
      console.log("No items found.");
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No invoices found" }),
      };
    }

    console.log("Data fetched:", JSON.stringify(data.Items[0], null, 2));

    const invoiceData = data.Items[0]; // Assuming data.Items[0] has the expected properties
    const summary = cleanAndFormatData(invoiceData);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
     body: JSON.stringify({summary})
    };
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
