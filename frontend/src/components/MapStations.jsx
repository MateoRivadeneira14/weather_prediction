import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Ajustar íconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapStations = ({ onSelectStation }) => {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    axios.get("http://184.72.86.112:8000/stations")
      .then((res) => setStations(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-full max-w-4xl rounded overflow-hidden shadow-md">
        <MapContainer
          center={[-0.20, -78.49]}
          zoom={11}
          style={{ height: "400px", width: "100%" }}
          className="rounded"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {stations.map((station) => (
            <Marker key={station.code} position={[station.lat, station.lon]}>
              <Popup>
                <div className="text-center">
                  <strong>{station.name}</strong><br />
                  Código: <span className="font-mono">{station.code}</span><br />
                  <button
                    onClick={() => onSelectStation(station.code)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 mt-2 rounded"
                  >
                    Seleccionar
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapStations;
