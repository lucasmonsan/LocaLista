<script lang="ts">
	import type { PhotonFeature } from '$lib/types//'

	export let results: PhotonFeature[] = []
	export let onSelect: (item: PhotonFeature) => void
</script>

<ul>
	{#each results as item}
		<li>
			<button on:click={() => onSelect(item)}>
				<div class="icon-marker">📍</div>
				<div class="text-info">
					<strong>{item.properties.name || item.properties.street || 'Local sem nome'}</strong>
					<small>
						{#if item.properties.district}{item.properties.district} -
						{/if}
						{item.properties.city || item.properties.town || ''}
					</small>
				</div>
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 200px; /* Limite de altura para scroll */
		overflow-y: auto;
	}

	li {
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	li:last-child {
		border-bottom: none;
	}

	button {
		width: 100%;
		background: transparent;
		border: none;
		padding: var(--sm);
		display: flex;
		align-items: center;
		gap: var(--sm);
		text-align: left;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	.icon-marker {
		font-size: 1.2rem;
	}

	.text-info {
		display: flex;
		flex-direction: column;
	}

	strong {
		font-size: 0.95rem;
		color: var(--text-color);
	}

	small {
		font-size: 0.8rem;
		color: var(--subtext-color);
	}
</style>
