import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { XMLParser } from "fast-xml-parser";
import "leaflet/dist/leaflet.css";
import "./Form.css";
import Summary from "../Summary/Summary";
import KMLDetails from "../KMLDetails/KMLDetails";
import { RenderKMLFeatures } from "../RenderKML/RenderKML";

const KMLViewer = () => {
  
  const [jsonData, setJsonData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [elementCounts, setElementCounts] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [lineLengths, setLineLengths] = useState([]);
  

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parser = new XMLParser();
      const json = parser.parse(text);
      setJsonData(json);

      // Extract element counts
      const counts = {};
      const lineData = [];
      const allowedElements = ["Point", "LineString", "Polygon"]; // Only these matter

      const extractCounts = (obj) => {
        if (typeof obj !== "object" || obj === null) return;

        for (let key in obj) {
          if (allowedElements.includes(key)) {
            counts[key] = (counts[key] || 0) + 1;
          }
          extractCounts(obj[key]); // Recursive search

          // Handle LineStrings & MultiLineStrings
          if (key === "LineString" || key === "MultiLineString") {
            const coords = obj[key]?.coordinates?.trim().split("\n");
            if (coords) {
              let totalLength = calculateLength(coords);
              lineData.push({ type: key, length: totalLength });
            }
          }
        }
      };
      extractCounts(json);
      setElementCounts(counts);
      setShowSummary(true);
      setLineLengths(lineData);
    };

    reader.readAsText(file);
  };

  // Function to calculate total length of LineString & MultiLineString
  const calculateLength = (coords) => {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lon1, lat1] = coords[i].trim().split(",").map(Number);
      const [lon2, lat2] = coords[i + 1].trim().split(",").map(Number);
      total += haversineDistance(lat1, lon1, lat2, lon2);
    }
    return total;
  };

  // Haversine formula to calculate distance between two coordinates
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const toRad = (angle) => (Math.PI / 180) * angle;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  //Marking on the map
  // 📌 Extract Features from KML and Render on Map
 
  
  return (
    <div>
      <div className="HeadForm"> 
        <h2>KML File Viewer</h2>
        <form>
         <label htmlFor="file-upload">Upload KML File:</label>
         <input
          id="file-upload"
          type="file"
          accept=".kml"
          onChange={handleFileUpload}
         />
        </form>   
      </div>
     
      <br />

      <div className="displayArea">
        {jsonData && (
          <>
            <button onClick={() => setShowSummary(!showSummary)}>
              {showSummary ? "Hide Summary" : "Show Summary"}
            </button>
            <button onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </>
        )}
        {showSummary && (
          <div className="summary-container">
            <Summary elementCounts={elementCounts} />
          </div>
        )}
        {showDetails && (
          <div className="summary-container">
            <KMLDetails lineLengths={lineLengths} />
          </div>
        )}
      </div>

      {/* {jsonData && (
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )} */}
      <div className="map-container">
       <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{height:500, width:800}}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {jsonData && <RenderKMLFeatures data={jsonData}/>}
        {console.log(jsonData)}
        {/* Markers and shapes will be added here */}
      </MapContainer>
      </div>
      
    </div>
  );
};

export default KMLViewer;
