import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Client, Databases } from 'appwrite';
import { DATABASE_ID, COLLECTIONS } from '../services/appwrite';
import 'leaflet/dist/leaflet.css';

// Configuração do Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

interface City {
  $id: string;
  name: string;
  lat: number;
  lon: number;
}

const MapTest = () => {
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados de Divinópolis
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.CITIES,
          '6839f3bb00129f1158eb' // Substitua por $id real de Divinópolis
        );
        setCity({
          $id: response.$id,
          name: response.name,
          lat: response.lat,
          lon: response.lon,
        });
      } catch (err: any) {
        setError('Erro ao buscar cidade: ' + err.message);
      }
    };
    fetchCity();
  }, []);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!city) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mapa de {city.name}</h1>
      <MapContainer
        center={[city.lat, city.lon]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[city.lat, city.lon]}>
          <Popup>{city.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapTest;