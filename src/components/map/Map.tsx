import './index.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Header } from '../header/Header';
import { Search } from "../search/Search";
import { useSearch } from '../../contexts/SearchContext';
import { useEffect } from 'react';

// Componente controlador separado (obrigatório para usar useMap)
const MapController = () => {
  const map = useMap();
  const { selectedCoords } = useSearch();

  useEffect(() => {
    if (selectedCoords) {
      map.flyTo([selectedCoords.lat, selectedCoords.lon], 15);
    }
  }, [selectedCoords]);

  return null;
};

export const Map = () => {
  return (
    <div id="MapContainer">
      <Header />
      <Search />
      <MapContainer
        center={[-15.7942, -47.8822]}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController />
      </MapContainer>
    </div>
  );
};