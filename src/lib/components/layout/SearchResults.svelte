<script lang="ts">
	export let results: any[] = []
	export let onSelect: (item: any) => void

	function select(item: any) {
		if (onSelect) onSelect(item)
	}
</script>

<ul>
	{#each results as item}
		<li>
			<button type="button" on:click={() => select(item)}>
				<strong>
					{item.properties.name || item.properties.street || 'Local sem nome'}
				</strong>
				<small>
					{item.properties.city || item.properties.town || ''},
					{item.properties.state || ''}
				</small>
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		background: var(--bg-color);
		border-top: var(--border) var(--subbg-color);
		border-bottom: var(--border) var(--subbg-color);
	}

	li {
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	li:last-child {
		border-bottom: none;
	}

	button {
		width: 100%;
		padding: var(--sm);
		background: transparent;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition: background 0.125s ease-in-out;
	}

	button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	strong {
		font-size: 1rem;
	}
	small {
		font-size: 0.8rem;
		opacity: 0.7;
	}
</style>
