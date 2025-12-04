import { writable } from 'svelte/store';

// Controle da Câmera do Mapa
export const mapView = writable({
  lat: -23.55052,
  lon: -46.63330,
  zoom: 12,
  trigger: 0
});

// Centro atual (para otimizar buscas)
export const currentMapCenter = writable({
  lat: -23.55052,
  lon: -46.63330
});

// Estado do Splash/Carregamento
export const isMapReady = writable(false);

// O CORAÇÃO DA NOVA UX:
// null = Modo Navegação (Footer aparece)
// Objeto = Modo Detalhes (BottomSheet aparece)
export const selectedLocation = writable<any>(null);

// Formulário final de review
export const isReviewFormOpen = writable(false);

export const isSearching = writable(false);

// Guarda o GeoJSON (desenho) da rua/bairro selecionado
export const highlightGeometry = writable<any>(null);

// Store para mensagens temporárias (Toast)
// null = sem mensagem
// string = mensagem a ser exibida
export const toastMessage = writable<string | null>(null);

// Guarda o objeto completo do último local que o usuário pesquisou e clicou no Footer
export const lastSearchedLocation = writable<any>(null);