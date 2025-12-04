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

export const toastStore = writable({
  persistent: null as { message: string, type?: 'info' } | null,
  temporary: null as { message: string, type: 'success' | 'error' | 'info' } | null
});

// Helper para disparar mensagens temporárias facilmente
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastStore.update(s => ({ ...s, temporary: { message, type } }));
  // Auto-dismiss após 3s
  setTimeout(() => {
    toastStore.update(s => {
      // Só limpa se a mensagem ainda for a mesma (evita limpar toast novo se o usuário clicou rápido)
      if (s.temporary?.message === message) return { ...s, temporary: null };
      return s;
    });
  }, 3000);
}

// Helper para definir/limpar mensagem fixa
export function setPersistentToast(message: string | null) {
  toastStore.update(s => ({ ...s, persistent: message ? { message, type: 'info' } : null }));
}

// Guarda o objeto completo do último local que o usuário pesquisou e clicou no Footer
export const lastSearchedLocation = writable<any>(null);

// Guarda o objeto do usuário logado (ou null)
export const user = writable<any>(null);

// Controla se a Bottom Sheet de Perfil está aberta
export const isProfileOpen = writable(false);

// Guarda a localização real do usuário (GPS)
export const userPosition = writable<{ lat: number; lon: number } | null>(null);