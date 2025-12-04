<script lang="ts">
	export let rating = 0
	export let readonly = false

	function setRating(value: number) {
		if (!readonly) rating = value
	}
</script>

<div class="stars" class:readonly>
	{#each [1, 2, 3, 4, 5] as star}
		<button type="button" class:filled={star <= rating} on:click={() => setRating(star)} disabled={readonly} aria-label="{star} Estrelas"> ★ </button>
	{/each}
</div>

<style>
	.stars {
		display: flex;
		gap: var(--xxs); /* Era 4px */
	}

	button {
		background: none;
		border: none;
		padding: 0;
		font-size: var(--xxl); /* Era 2rem */
		line-height: 1;
		color: var(--subbg-color); /* Estrela vazia */
		cursor: pointer;
		transition:
			transform var(--fast),
			color var(--fast);
	}

	button.filled {
		color: #ffc107; /* Amarelo (pode criar --color-star se quiser) */
	}

	.stars:not(.readonly) button:hover {
		transform: scale(1.2);
	}

	.readonly button {
		cursor: default;
		font-size: var(--lg); /* Era 1.2rem */
	}
</style>
