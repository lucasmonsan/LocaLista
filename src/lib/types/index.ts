export interface AppLocation {
  id: number | null; // null se for um local do Photon (não salvo no banco)
  nome: string;
  cidade: string;
  lat: number;
  lon: number;
  endereco?: any; // Objeto GeoJSON bruto retornado pelo Photon/Nominatim
  media_rating?: number;
  total_reviews?: number;
}

export interface MapViewState {
  lat: number;
  lon: number;
  zoom: number;
  trigger: number; // Timestamp para forçar re-render ou flyTo
}

export interface UserPosition {
  lat: number;
  lon: number;
}

// Tipagem para os resultados brutos da API Photon
export interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    name?: string;
    street?: string;
    city?: string;
    town?: string;
    countrycode?: string;
    osm_type?: string;
    osm_id?: number;
    [key: string]: any;
  };
}

export interface Review {
  id: number;
  local_id: number;
  user_id: string | null;
  rating: number;
  comentario: string | null;
  tags: string[];
  created_at: string;
  locais?: AppLocation; // Para o join
}