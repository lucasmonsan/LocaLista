import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Map.module.css';
import { useTranslation } from 'react-i18next';

L.Icon.Default.imagePath = ''

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/pins/marker-icon-2x.png',
  iconUrl: '/pins/marker-icon.png',
  shadowUrl: '/pins/marker-shadow.png',
});

interface MapComponentProps {
  searchCoordinates: L.LatLngTuple | null;
}

const UpdateMapCenter: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const TileLayerWithTheme: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const currentTileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png';
  const currentAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const tileLayerKey = theme;

  return (
    <TileLayer
      key={tileLayerKey}
      attribution={currentAttribution}
      url={currentTileUrl}
    />
  );
};

export const Map: React.FC<MapComponentProps> = ({ searchCoordinates }) => {
  const { t } = useTranslation();
  const [currentCenter, setCurrentCenter] = useState<L.LatLngTuple>([0, 0]);
  const [currentZoom, setCurrentZoom] = useState<number>(4);
  const [markerPosition, setMarkerPosition] = useState<L.LatLngTuple | null>(null);
  const [markerText, setMarkerText] = useState<string>('');

  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (searchCoordinates) {
      setCurrentCenter(searchCoordinates);
      setCurrentZoom(13);
      setMarkerPosition(searchCoordinates);
      setMarkerText(t('searched_location'));
    } else {
      setCurrentCenter([20, 0]);
      setCurrentZoom(3);
      setMarkerPosition(null);
      setMarkerText('');
    }
  }, [searchCoordinates, t]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        ref={mapRef}
        center={currentCenter}
        zoom={currentZoom}
        minZoom={4}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayerWithTheme />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>{markerText}</Popup>
          </Marker>
        )}
        {(currentCenter && currentZoom) && <UpdateMapCenter center={currentCenter} zoom={currentZoom} />}
      </MapContainer>
    </div>
  );
};