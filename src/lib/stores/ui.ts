import { writable } from 'svelte/store';

// Controle de Modais e Paineis
export const isReviewFormOpen = writable(false);
export const isSearching = writable(false); // Controla o Blur
export const isProfileOpen = writable(false); // BottomSheet de Login

// Sistema de Toast (Notificações)
interface ToastState {
  persistent: { message: string; type?: 'info' } | null;
  temporary: { message: string; type: 'success' | 'error' | 'info' } | null;
}

export const toastStore = writable<ToastState>({
  persistent: null,
  temporary: null
});

// --- Helpers de Toast ---

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastStore.update(s => ({ ...s, temporary: { message, type } }));

  setTimeout(() => {
    toastStore.update(s => {
      // Só limpa se a mensagem ainda for a mesma (evita race condition)
      if (s.temporary?.message === message) return { ...s, temporary: null };
      return s;
    });
  }, 3000);
}

export function setPersistentToast(message: string | null) {
  toastStore.update(s => ({
    ...s,
    persistent: message ? { message, type: 'info' } : null
  }));
}