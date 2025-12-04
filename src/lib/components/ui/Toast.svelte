<script lang="ts">
	import { toastMessage } from '$lib/stores'
	import { fly } from 'svelte/transition'
	import { onMount } from 'svelte'

	// Fecha automaticamente após 4 segundos
	let timeout: any

	// Reage a mudanças na store
	$: if ($toastMessage) {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => {
			toastMessage.set(null)
		}, 4000)
	}
</script>

{#if $toastMessage}
	<div class="toast" transition:fly={{ y: -50, duration: 300 }}>
		<p>{$toastMessage}</p>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: var(--lg); /* Margem do topo */
		left: 50%;
		transform: translateX(-50%); /* Centraliza */
		z-index: var(--z-modal); /* Acima de tudo */

		background-color: var(--text-color); /* Fundo escuro */
		color: var(--bg-color); /* Texto claro */

		padding: var(--sm) var(--md);
		border-radius: 50px; /* Pílula */
		box-shadow: var(--shadow-black);

		max-width: 90%;
		text-align: center;
		pointer-events: none; /* Deixa clicar no mapa através dele */
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 500;
	}
</style>
