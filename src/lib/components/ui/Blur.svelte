<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

	let trigger = false

	onMount(() => (trigger = true))
</script>

{#if trigger}
	<button type="button" transition:fade on:click aria-label="Fechar pesquisa"></button>
{/if}

<style>
	button {
		display: block;
		z-index: var(--z-blur, 900);
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(var(--xs, 4px));
	}
</style>
