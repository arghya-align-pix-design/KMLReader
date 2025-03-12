import {Marker, Polyline, Polygon, Popup ,useMap, Tooltip } from "react-leaflet";
import L from "leaflet"; // For custom icon
import 'leaflet/dist/leaflet.css';

const arrowIcon = L.divIcon({
  className: 'arrow-icon',
  html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,10 20,0" fill="red"/></svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10], // Adjusts position
});

const redDotIcon = L.icon({
  iconUrl: './icons8-red-dot-48.png', // Ensure this path is correct
  iconSize: [25, 25],
});

export const RenderKMLFeatures = ({data}) => {
    console.log(data);

    

    const Map = useMap(); // Get access to the map instance
   
    if (!data || !data.kml || !data.kml.Document || !data.kml.Document.Placemark){
        console.log("No Proper KML file found!!");
        return null;
    } 
  
    const placemarks = data.kml.Document.Placemark;
    const features = [];
    const bounds = []; // Store all coordinates to adjust view
    
    console.log("Extracting features from:", placemarks);
  
    const parseCoordinates = (coordString) => {
      if (!coordString) return null;
      return coordString
        .trim()
        .split(/\s+/)
        .map((coord) => {
          const [lon, lat] = coord.trim().split(",").map(Number);
          return isNaN(lon) || isNaN(lat) ? null : [lat, lon];
        })
        .filter(Boolean);
    };
  
    const addFeature = (element, type, name) => {
      if (!element || typeof element !== "object") return;
  
      if (type === "Point" && element.coordinates) {
        const [lon, lat] = element.coordinates.trim().split(",").map(Number);
        if (!isNaN(lon) && !isNaN(lat)) {
          features.push(
            <Marker key={`${lat}-${lon}`} position={[lat, lon]} icon={redDotIcon}  >  {/*icon={L.icon({iconUrl: 'path-to-your-red-dot-icon.png', iconSize: [25, 25]})}*/}
              <Popup autoOpen={true}>{name}</Popup>
              <Tooltip>{name}</Tooltip>
              {/* <Popup>Point</Popup> */}
            </Marker>
          );
          bounds.push([lat, lon]); // Add to bounds
        }
      }
  
      if (type === "LineString" && element.coordinates) {
        const coords = parseCoordinates(element.coordinates);
        if (coords.length) {
          coords.forEach(([lat, lon]) => bounds.push([lat, lon])); // Add all points to bounds
          features.push(<Polyline key={`${coords[0]}`} positions={coords} color="blue" />);
        }
      }
  
      if (type === "Polygon" && element.outerBoundaryIs?.LinearRing?.coordinates) {
        const coords = parseCoordinates(element.outerBoundaryIs.LinearRing.coordinates);
        if (coords.length) {
          coords.forEach(([lat, lon]) => bounds.push([lat, lon])); // Add to bounds
          features.push(<Polygon key={`${coords[0]}`} positions={coords} color="red" />);
        }
      }
    };
  
    const extractFeatures = (obj) => {
      if (!obj || typeof obj !== "object") return;
  
      if (obj.Point) addFeature(obj.Point, "Point", obj.name);
      if (obj.LineString) addFeature(obj.LineString, "LineString", obj.name);
      if (obj.Polygon) addFeature(obj.Polygon, "Polygon",obj.name);
  
      Object.values(obj).forEach(extractFeatures);
    };
  
    extractFeatures(data.kml.Document);
  
    // Auto-adjust map to fit all KML features
    if (bounds.length > 0) {
      Map.fitBounds(bounds, { padding: [50, 50] });
    }
  
    return features;
  };