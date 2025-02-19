import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

// Initialize AWS clients
const textractClient = new TextractClient({ region: "us-east-1" });
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });

// Function to process errors
const processError = (error) => ({
  errorType: error.name || "UnknownError",
  errorMessage: error.message || "An unknown error occurred",
  stackTrace: error.stack || "No stack trace available",
});

// Function to extract forms and tables (unchanged)
const extractFormsAndTables = (response) => {
  const keyValuePairs = [];
  const tables = [];
  const blockMap = {};

  response.Blocks.forEach((block) => {
    blockMap[block.Id] = block;
  });

  response.Blocks.forEach((block) => {
    if (block.BlockType === "KEY_VALUE_SET" && block.EntityTypes.includes("KEY")) {
      const keyBlock = block;
      const valueBlockIds = keyBlock.Relationships?.find((rel) => rel.Type === "VALUE")?.Ids || [];
      const valueTexts = valueBlockIds.map((id) => {
        const valueBlock = blockMap[id];
        if (valueBlock?.Relationships) {
          return valueBlock.Relationships.find((rel) => rel.Type === "CHILD")?.Ids
            .map((childId) => blockMap[childId]?.Text || "")
            .join(" ");
        }
        return valueBlock?.Text || "";
      });
      const keyTexts = keyBlock.Relationships?.find((rel) => rel.Type === "CHILD")?.Ids
        .map((id) => blockMap[id]?.Text || "")
        .join(" ");
      keyValuePairs.push({ key: keyTexts || "UNKNOWN_KEY", value: valueTexts.join(", ") || "UNKNOWN_VALUE" });
    }
  });

  response.Blocks.forEach((block) => {
    if (block.BlockType === "TABLE") {
      const tableRows = [];
      const relationships = block.Relationships || [];
      relationships.forEach((rel) => {
        if (rel.Type === "CHILD") {
          const cells = rel.Ids.map((id) => blockMap[id]).filter((b) => b.BlockType === "CELL");
          cells.forEach((cell) => {
            const rowIndex = cell.RowIndex - 1;
            const colIndex = cell.ColumnIndex - 1;
            const cellText = cell.Relationships?.find((rel) => rel.Type === "CHILD")?.Ids
              .map((childId) => blockMap[childId]?.Text || "")
              .join(" ") || "";
            if (!tableRows[rowIndex]) tableRows[rowIndex] = [];
            tableRows[rowIndex][colIndex] = cellText;
          });
        }
      });
      const cleanedTable = tableRows
        .filter((row) => row && row.some((cell) => cell?.trim() !== ""))
        .map((row) => row.filter((cell) => cell?.trim() !== ""));
      tables.push(cleanedTable);
    }
  });

  return { keyValuePairs, tables };
};

// Lambda handler function
export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  const partitionKeyName = process.env.FETCH_TABLE_KEY;

  try {
    if (event.Records && event.Records.length > 0) {
      const fileObj = event.Records[0];
      const bucketName = fileObj.s3.bucket.name;
      const fileName = decodeURIComponent(fileObj.s3.object.key.replace(/\+/g, " "));

      console.log(`Bucket: ${bucketName} ::: Key: ${fileName}`);

      // Step 1: Delete existing data from DynamoDB
      const deleteParams = {
        TableName: tableName,
        Key: { [partitionKeyName]: { S: fileName } }, // Match the actual partition key
      };

      await dynamoDBClient.send(new DeleteItemCommand(deleteParams));
      console.log("Previous data deleted successfully from DynamoDB");

      // Step 2: Call Textract to analyze document
      const textractParams = {
        Document: {
          S3Object: {
            Bucket: bucketName,
            Name: fileName,
          },
        },
        FeatureTypes: ["FORMS", "TABLES"],
      };

      const textractResponse = await textractClient.send(new AnalyzeDocumentCommand(textractParams));
      console.log("Textract response:", JSON.stringify(textractResponse, null, 2));

      // Extract forms and tables
      const { keyValuePairs, tables } = extractFormsAndTables(textractResponse);
      console.log("Extracted Forms (Key-Value Pairs):", keyValuePairs);
      console.log("Extracted Tables:", tables);

      // Step 3: Store new data in DynamoDB
      const dynamoParams = {
        TableName: tableName,
        Item: {
          [partitionKeyName]: { S: fileName },
          uploadDate: { S: new Date().toISOString() },
          keyValuePairs: { S: JSON.stringify(keyValuePairs) },
          tables: { S: JSON.stringify(tables) },
        },
      };

      await dynamoDBClient.send(new PutItemCommand(dynamoParams));
      console.log("New data successfully stored in DynamoDB");

      return {
        statusCode: 200,
        body: JSON.stringify("Document processed and stored successfully!"),
      };
    }
  } catch (error) {
    const errorMsg = processError(error);
    console.error("Error:", errorMsg);

    return {
      statusCode: 500,
      body: JSON.stringify("Error processing the document!"),
    };
  }
};
