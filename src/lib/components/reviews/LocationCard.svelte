<script lang="ts">
	import { selectedLocation } from '$lib/stores'
	import { fade, fly } from 'svelte/transition'

	// Função fictícia para abrir o form (faremos depois)
	const confirmLocation = () => {
		alert('Abrir formulário para: ' + $selectedLocation.nome)
	}
</script>

{#if $selectedLocation}
	<div class="card" transition:fly={{ y: 50, duration: 300 }}>
		<div class="info">
			<strong>{$selectedLocation.nome}</strong>
			<small>{$selectedLocation.cidade || 'Local desconhecido'}</small>
		</div>

		<div class="actions">
			{#if $selectedLocation.id}
				<button class="btn-primary">Ver Reviews</button>
			{:else}
				<button class="btn-confirm" on:click={confirmLocation}>Criar Review Aqui</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.card {
		position: fixed;
		bottom: calc(var(--xxxxl) + var(--xl)); /* Acima da barra de pesquisa */
		left: 50%;
		transform: translateX(-50%) !important; /* Centraliza (força bruta no svelte transition) */

		width: 90%;
		max-width: 400px;
		background: var(--bg-color);
		padding: var(--md);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-black);
		z-index: var(--z-modal);

		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--sm);
	}

	.info {
		display: flex;
		flex-direction: column;
	}

	small {
		color: var(--subtext-color);
	}

	button {
		padding: var(--xs) var(--md);
		border: none;
		border-radius: var(--radius-3);
		font-weight: bold;
		cursor: pointer;
	}

	.btn-confirm {
		background-color: var(--primary-color);
		color: white;
	}
</style>
