import { createClient } from '@supabase/supabase-js'
// O SvelteKit importa as variáveis automaticamente daqui
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Não precisamos mais do 'if', o SvelteKit garante que elas existem ou avisa no build
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)