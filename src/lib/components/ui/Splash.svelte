<script>
	import { fade } from 'svelte/transition'
	import LogoIcon from '$lib/icons/LogoIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'
	import { isMapReady } from '$lib/stores/' // Importa a store
</script>

{#if !$isMapReady}
	<section transition:fade={{ duration: 600 }}>
		<div class="content">
			<LogoIcon />
			<h1 in:fade={{ delay: 300 }}>LocaLista</h1>
		</div>

		<div class="loader" in:fade={{ delay: 600 }}>
			<LoadingIcon />
		</div>
	</section>
{/if}

<style>
	section {
		z-index: var(--z-splash); /* Deve ser maior que o mapa (ex: 9999) */
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: var(--bg-color);
		fill: var(--bg-color);
		background: var(--primary-color);
	}

	/* Agrupei Logo e H1 para organizar */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: calc(var(--md) * 5);
	}

	.loader {
		position: fixed;
		bottom: var(--md);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--xxxxl);
		height: var(--xxxxl);
	}
</style>
