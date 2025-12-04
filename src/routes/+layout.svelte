<script lang="ts">
	import { onMount } from 'svelte'
	import { user } from '$lib/stores/'
	import { supabase } from '$lib/services/supabase'
	import favicon from '$lib/assets/favicon.svg'
	import Splash from '$lib/components/ui/Splash.svelte' // Ajuste se mudou a pasta
	import '$lib/styles/all.css'

	let { children } = $props()

	onMount(() => {
		// 1. Verifica sessão inicial ao abrir o app
		supabase.auth.getSession().then(({ data: { session } }) => {
			user.set(session?.user ?? null)
		})

		// 2. Escuta mudanças (Login, Logout, Token Expirado)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			user.set(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Splash />
{@render children()}
