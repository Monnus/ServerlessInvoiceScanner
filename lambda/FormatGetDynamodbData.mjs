
const cleanAndFormatData = (rawData) => {
    try {
      const keyValuePairs = JSON.parse(rawData.keyValuePairs?.S || "[]");
      const tables = JSON.parse(rawData.tables?.S || "[]");
  
      // Clean key-value pairs and turn them into a single summary string
      const cleanedKeyValuePairs = keyValuePairs
        .filter((pair) => pair.value && pair.value !== "UNKNOWN_VALUE")
        .map((pair) => `${pair.key}: ${pair.value}`)
        .join("\n");
  
      // Format table data into a readable string format
      const formattedTables = tables
        .map((table, tableIndex) => {
          const formattedRows = table.map((row) => row.join(" | ")).join("\n");
          return `Table ${tableIndex + 1}:\n${formattedRows}`;
        })
        .join("\n\n");
  
      // Combine the summary
      const summary = `
  Invoice ID: ${rawData["invoice.pdf"]?.S || "N/A"}
  Upload Date: ${rawData.uploadDate?.S || "N/A"}
  
  -- Key-Value Pairs --
  ${cleanedKeyValuePairs}
  
  -- Tables --
  ${formattedTables}
      `;
  
      return summary.trim();
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Error processing the data.";
    }
  };
  export default cleanAndFormatData;