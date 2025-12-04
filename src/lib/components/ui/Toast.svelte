<script lang="ts">
	import { toastStore } from '$lib/stores'
	import { fly } from 'svelte/transition'
</script>

<div class="toast-container">
	{#if $toastStore.persistent}
		<div class="toast persistent" transition:fly={{ y: -20, duration: 300 }}>
			<p>{$toastStore.persistent.message}</p>
		</div>
	{/if}

	{#if $toastStore.temporary}
		<div
			class="toast temporary"
			class:success={$toastStore.temporary.type === 'success'}
			class:error={$toastStore.temporary.type === 'error'}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<p>{$toastStore.temporary.message}</p>
		</div>
	{/if}
</div>

<style>
	.toast-container {
		position: fixed;
		top: var(--lg);
		left: 0;
		width: 100%;
		pointer-events: none; /* Deixa clicar no mapa através do container */
		z-index: var(--z-modal); /* Deve ficar acima de tudo */

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sm);
	}

	.toast {
		padding: var(--sm) var(--md);
		border-radius: 50px;
		box-shadow: var(--shadow-black);
		max-width: 90%;
		text-align: center;
		pointer-events: auto; /* O toast em si bloqueia clique (opcional) */
		font-size: 0.95rem;
		font-weight: 500;
	}

	/* Estilo Persistente (Instrução - Neutro) */
	.persistent {
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--subbg-color);
	}

	/* Estilo Temporário (Alerta) */
	.temporary {
		background-color: var(--text-color); /* Padrão escuro */
		color: var(--bg-color);
		z-index: 10;
	}

	.temporary.success {
		background-color: #10b981; /* Verde */
		color: white;
	}

	.temporary.error {
		background-color: #ef4444; /* Vermelho */
		color: white;
	}

	p {
		margin: 0;
	}
</style>
