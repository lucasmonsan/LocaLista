import { writable } from 'svelte/store';
import type { AppLocation, MapViewState, UserPosition } from '$lib/types/';

// Controle da Câmera (Posição e Zoom)
export const mapView = writable<MapViewState>({
  lat: -23.55052,
  lon: -46.63330,
  zoom: 12,
  trigger: 0
});

// Centro atual (para otimizar buscas API)
export const currentMapCenter = writable<UserPosition>({
  lat: -23.55052,
  lon: -46.63330
});

// Onde o usuário está fisicamente (GPS)
export const userPosition = writable<UserPosition | null>(null);

// Local Selecionado (Trigger para o BottomSheet)
export const selectedLocation = writable<AppLocation | null>(null);

// Último local pesquisado (para resolução de conflitos de clique)
export const lastSearchedLocation = writable<any>(null);

// GeoJSON de ruas/bairros
export const highlightGeometry = writable<any>(null);

// Estado de carregamento do mapa (para remover a Splash Screen)
export const isMapReady = writable(false);