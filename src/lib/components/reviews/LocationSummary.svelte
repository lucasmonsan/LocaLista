<script lang="ts">
	import { supabase } from '$lib/supabaseClient'
	import { selectedLocation } from '$lib/stores'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	// Props para comunicar com o pai
	export let onViewReviews: () => void
	export let onCreateReview: () => void

	let averageRating = 0
	let reviewsCount = 0
	let isLoadingStats = false

	// Busca estatísticas sempre que o ID mudar
	$: if ($selectedLocation?.id) {
		fetchStats($selectedLocation.id)
	}

	async function fetchStats(localId: number) {
		isLoadingStats = true
		try {
			const { data, error } = await supabase.from('reviews').select('rating').eq('local_id', localId)

			if (error) throw error

			if (data && data.length > 0) {
				reviewsCount = data.length
				const total = data.reduce((acc, curr) => acc + curr.rating, 0)
				averageRating = total / reviewsCount
			} else {
				reviewsCount = 0
				averageRating = 0
			}
		} catch (err) {
			console.error('Erro stats:', err)
		} finally {
			isLoadingStats = false
		}
	}
</script>

<div class="summary-container">
	{#if $selectedLocation?.id}
		<div class="stats">
			{#if isLoadingStats}
				<div class="loader-wrapper"><LoadingIcon /></div>
			{:else}
				<span class="rating">⭐ {averageRating.toFixed(1)}</span>
				<span class="count">• {reviewsCount} avaliações</span>
			{/if}
		</div>

		<div class="actions">
			<button class="btn-primary" on:click={onViewReviews}>Ver Reviews</button>
			<button class="btn-outline" on:click={onCreateReview}>Avaliar</button>
		</div>
	{:else}
		<div class="empty-state">
			<p>Este local ainda não foi avaliado.</p>
			<small>Confira o endereço e crie a primeira review!</small>
		</div>
		<button class="btn-primary full" on:click={onCreateReview}> Criar Primeira Review </button>
	{/if}
</div>

<style>
	.summary-container {
		animation: fadeIn 0.3s;
	}

	.stats {
		font-weight: 500;
		font-size: 1.1rem;
		display: flex;
		align-items: center;
		gap: var(--xs);
		height: 24px;
		margin-bottom: var(--md);
	}

	.empty-state {
		margin-bottom: var(--md);
		color: var(--subtext-color);
	}
	.empty-state small {
		display: block;
		margin-top: var(--xs);
		opacity: 0.7;
	}

	.actions {
		display: flex;
		gap: var(--sm);
	}

	button {
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		border-radius: var(--radius-2);
		padding: var(--sm);
	}

	.btn-primary {
		background: var(--primary-color);
		color: white;
		border: none;
		flex: 1;
	}
	.btn-primary.full {
		width: 100%;
	}

	.btn-outline {
		background: transparent;
		border: 2px solid var(--subbg-color);
		color: var(--text-color);
		flex: 1;
	}

	.loader-wrapper {
		width: var(--lg); /* Era 24px */
		height: var(--lg);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
