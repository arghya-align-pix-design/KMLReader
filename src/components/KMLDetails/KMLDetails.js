import React from "react";
import "./KMLDetails.css";

const KMLDetails = ({ lineLengths }) => {
  if (!lineLengths || lineLengths.length === 0) {
    return null; // Hide if no data
  }

  return (
    <div className="details-container">
      <h3>Detailed View</h3>
      <table>
        <thead>
          <tr>
            <th>Element Type</th>
            <th>Total Length</th>
          </tr>
        </thead>
        <tbody>
          {lineLengths.map(({ type, length }, index) => (
            <tr key={index}>
              <td>{type}</td>
              <td>{length.toFixed(2)} km</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KMLDetails;
