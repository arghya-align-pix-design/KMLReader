import React from "react";
import "./Summary.css";

const KMLSummary = ({ elementCounts }) => {
  if (!elementCounts || Object.keys(elementCounts).length === 0) {
    return null; // Hide component if no data
  }

  return (
    <div>
      <h3>Summary</h3>
      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Element Type</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(elementCounts).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KMLSummary;
