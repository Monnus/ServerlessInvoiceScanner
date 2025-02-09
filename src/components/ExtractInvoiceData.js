import React, { useState } from "react";
import "../styles/loader.css";

const ViewData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);  // New loading state
  

  const handleFetchData = async () => {
    setError(null);
    setData(null);
    setLoading(true);  // Start loading

    try {
      const response = await fetch(
        "https://0u7hzhwtab.execute-api.us-east-1.amazonaws.com/dev"
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const result = await response.json();
      const parsedBody = JSON.parse(result.body); // Parse the stringified body
      setData(parsedBody);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);  // Stop loading
    }
  };
  const handleClearData = () => {
    setData(null);
    setError(null);
  };


  return (
    <div style={{marginTop:"10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
      {/* Left Column: Button */}
      <div style={{ flex: "1", padding: "10px" }}>
        <button onClick={handleFetchData} style={{ padding: "10px 20px", fontSize: "16px" }}>
          View Latest Extracted Data
        </button>
         <button onClick={handleClearData} style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#f44336", color: "#fff" }}>
          Clear Data
      </button>
      </div>

      {/* Right Column: Display Data */}
      <div style={{ flex: "2", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
        <h2>Latest Invoice Data</h2>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div className="loader"></div>  {/* Loader spinner */}
            <p>Loading data...</p>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : data ? (
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{data.summary}</pre>
        ) : (
          <p>No data fetched yet. Click the button to view the latest extracted data.</p>
        )}
      </div>
    </div>
  );
};

export default ViewData;
