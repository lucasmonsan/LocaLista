import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../../contexts/ThemeContext'; // Ajuste o caminho se necessário

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Search } from '../search/Search';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const tileLayersData = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: { // Substituindo o Carto Dark Matter
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }
}

export const Map = () => {
  const { theme } = useTheme();
  const position: L.LatLngExpression = [-23.55052, -46.633308];
  const currentTileLayer = tileLayersData[theme];

  return (
    <MapContainer
      key={theme} // IMPORTANTE: Força a recriação do TileLayer ao mudar o tema
      center={position}
      zoom={13}
      style={{ display: "flex", justifyContent: "center", height: '100%', width: '100%' }} // Para preencher o contêiner pai
    >
      <TileLayer
        url={currentTileLayer.url}
        attribution={currentTileLayer.attribution}
      />
      {/* 
      <Marker position={position}>
        <Popup>Popup</Popup>
      </Marker>
      */}

      <Search />
    </MapContainer>
  );
};