<script lang="ts">
	export let selectedTags: string[] = []

	const OPTIONS = ['Silencioso', 'Barulhento', 'Seguro', 'Perigoso', 'Boa Iluminação', 'Portaria 24h', 'Infiltração', 'Vizinhos Chatos', 'Bem Localizado', 'Mofo']

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag)
		} else {
			selectedTags = [...selectedTags, tag]
		}
	}
</script>

<div class="tags-grid">
	{#each OPTIONS as tag}
		<button type="button" class:selected={selectedTags.includes(tag)} on:click={() => toggleTag(tag)}>
			{tag}
		</button>
	{/each}
</div>

<style>
	.tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--xs); /* Era 8px */
	}

	button {
		background: var(--bg-color);
		border: 1px solid var(--subbg-color);
		/* Era 20px (Pílula). Usamos um valor alto ou variável grande */
		border-radius: var(--xxl);
		padding: var(--xxs) var(--sm); /* Era 6px 12px */
		font-size: 0.85rem; /* Fonte pequena ok, ou crie --font-sm */
		color: var(--text-color);
		cursor: pointer;
		transition: all var(--fast);
	}

	button.selected {
		background: var(--primary-color);
		color: var(--bg-color); /* Contraste melhor que white puro se bg mudar */
		border-color: var(--primary-color);
	}
</style>
