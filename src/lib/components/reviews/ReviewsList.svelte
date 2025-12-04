<script lang="ts">
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabaseClient'
	import StarRating from '$lib/components/ui/StarRating.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte' // Certifique-se que está importado
	import { user } from '$lib/stores'

	export let localId: number
	export let onBack: () => void

	let reviews: any[] = []
	let isLoading = false
	let page = 0
	const LIMIT = 10
	let hasMore = true

	async function fetchReviews() {
		if (isLoading) return
		isLoading = true

		try {
			const from = page * LIMIT
			const to = from + LIMIT - 1

			const { data, error } = await supabase.from('reviews').select('*').eq('local_id', localId).order('created_at', { ascending: false }).range(from, to)

			if (error) throw error

			if (data && data.length > 0) {
				reviews = [...reviews, ...data]
				if (data.length < LIMIT) hasMore = false
				page++
			} else {
				hasMore = false
			}
		} catch (err) {
			console.error('Erro reviews:', err)
		} finally {
			isLoading = false
		}
	}

	function formatDate(isoString: string) {
		return new Date(isoString).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	}

	function getAuthorName(reviewUserId: string | null) {
		// Se não tem ID, é Anônimo antigo
		if (!reviewUserId) return 'Anônimo'

		// Se o ID bate com o usuário logado
		if ($user && reviewUserId === $user.id) return 'Você'

		// Se tem ID mas não sou eu (Opcional: Pode ser "Usuário" ou manter "Anônimo")
		return 'Usuário LocaLista'
	}

	onMount(() => {
		fetchReviews()
	})
</script>

<div class="list-container">
	<div class="list-header">
		<button class="back-btn" on:click={onBack}>← Voltar</button>
		<h3>Avaliações</h3>
	</div>

	<div class="scroll-area">
		{#if reviews.length === 0 && !isLoading}
			<div class="empty">
				<p>Nenhuma avaliação carregada.</p>
			</div>
		{/if}

		{#each reviews as review}
			<div class="review-card">
				<div class="review-header">
					<div class="author-info">
						<strong>{getAuthorName(review.user_id)}</strong>
						<span class="date">{formatDate(review.created_at)}</span>
					</div>
					<div class="mini-stars">
						<StarRating rating={review.rating} readonly={true} />
					</div>
				</div>

				{#if review.tags && review.tags.length > 0}
					<div class="tags-row">
						{#each review.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}

				<p class="comment">{review.comentario || ''}</p>
			</div>
		{/each}

		<div class="footer-actions">
			{#if isLoading}
				<div class="loading-wrap">
					<LoadingIcon />
				</div>
			{:else if hasMore}
				<button class="load-more" on:click={fetchReviews}> Carregar mais </button>
			{:else if reviews.length > 0}
				<p class="end-msg">Fim das avaliações.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.list-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		animation: fadeIn 0.3s ease-in;
	}

	.list-header {
		padding: 0 var(--md) var(--sm);
		display: flex;
		align-items: center;
		gap: var(--md);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.back-btn {
		background: none;
		border: none;
		color: var(--primary-color);
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		font-size: 0.9rem;
	}

	.scroll-area {
		flex: 1;
		overflow-y: auto;
		padding: var(--md);
	}

	.review-card {
		background: var(--bg-color);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: var(--radius-2);
		padding: var(--md);
		margin-bottom: var(--md);
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--sm);
	}
	.author-info {
		display: flex;
		flex-direction: column;
	}
	.author-info strong {
		font-size: 0.9rem;
	}
	.date {
		font-size: 0.8rem;
		color: var(--subtext-color);
	}

	.mini-stars {
		transform: scale(0.8);
		transform-origin: right top;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: var(--sm);
	}
	.tag {
		background: rgba(0, 0, 0, 0.05);
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		color: var(--text-color);
	}

	.comment {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--text-color);
		white-space: pre-wrap;
	}

	.footer-actions {
		display: flex;
		justify-content: center;
		padding: var(--md) 0;
	}

	.load-more {
		background: transparent;
		border: 1px solid var(--subbg-color);
		padding: var(--sm) var(--md);
		border-radius: 20px;
		color: var(--text-color);
		cursor: pointer;
	}

	.end-msg {
		color: var(--subtext-color);
		font-size: 0.9rem;
		font-style: italic;
	}

	.empty {
		text-align: center;
		color: var(--subtext-color);
		margin-top: var(--xl);
	}

	/* --- CORREÇÃO DO LOADING --- */
	.loading-wrap {
		width: var(--lg); /* Era 24px */
		height: var(--lg);
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
	}

	/* Força SVG a preencher */
	.loading-wrap :global(svg) {
		width: 100%;
		height: 100%;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
