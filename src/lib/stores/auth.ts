import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

// Guarda o objeto do usuário logado (Tipagem oficial do Supabase)
export const user = writable<User | null>(null);