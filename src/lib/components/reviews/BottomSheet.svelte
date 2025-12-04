<script lang="ts">
	import { fly, fade } from 'svelte/transition'

	// Stores
	import { selectedLocation, lastSearchedLocation, user, isProfileOpen } from '$lib/stores/'
	import type { AppLocation } from '$lib/types/'

	// Ícones
	import XIcon from '$lib/icons/XIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	// Componentes Internos
	import LocationSummary from '$lib/components/reviews/LocationSummary.svelte'
	import ReviewForm from '$lib/components/reviews/ReviewForm.svelte'
	import ReviewsList from '$lib/components/reviews/ReviewsList.svelte'

	let mode: 'view' | 'edit' | 'list' | 'conflict' | 'loading' = 'view'

	// Tipagem correta ao invés de 'any'
	let optionSearch: AppLocation | null = null
	let optionClick: AppLocation | null = null

	let ignoreNextUpdate = false

	// Bloco Reativo Controlado
	$: if ($selectedLocation) {
		if (ignoreNextUpdate) {
			ignoreNextUpdate = false
		} else {
			handleLocationChange($selectedLocation)
		}
	}

	function handleLocationChange(loc: AppLocation) {
		if (loc.id) {
			mode = 'view'
		} else if (loc.nome === 'Buscando endereço...') {
			mode = 'loading'
		} else {
			checkConflict(loc)
		}
	}

	function checkConflict(loc: AppLocation) {
		const clickedName = loc.nome
		const normClick = clickedName?.trim().toLowerCase()

		let hasConflict = false
		optionClick = loc
		optionSearch = null

		if ($lastSearchedLocation) {
			const searchedName = $lastSearchedLocation.properties.name || $lastSearchedLocation.properties.street
			const normSearch = searchedName?.trim().toLowerCase()

			if (normSearch && normSearch !== normClick && normClick !== 'local sem nome') {
				hasConflict = true
				// Converte o objeto do Photon para AppLocation
				optionSearch = {
					...loc, // Mantém lat/lon do clique
					nome: searchedName,
					cidade: $lastSearchedLocation.properties.city || $lastSearchedLocation.properties.town,
					endereco: $lastSearchedLocation,
				}
			}
		}

		mode = hasConflict ? 'conflict' : 'view'
	}

	function handleStartReview() {
		if (!$user) {
			alert('Você precisa entrar na sua conta para avaliar.')
			isProfileOpen.set(true)
			return
		}
		mode = 'edit'
	}

	function resolveConflict(chosenLocation: AppLocation) {
		// Atualiza store sem disparar o loop reativo do inicio
		ignoreNextUpdate = true
		selectedLocation.set(chosenLocation)

		if (!$user) {
			alert('Endereço definido. Faça login para continuar a avaliação.')
			isProfileOpen.set(true)
			mode = 'view'
		} else {
			mode = 'edit'
		}
	}

	function searchAgain() {
		selectedLocation.set(null)
	}

	function close() {
		selectedLocation.set(null)
	}
</script>

{#if $selectedLocation}
	<div class="sheet" class:full-height={mode === 'list'} transition:fly={{ y: 300, duration: 300 }}>
		<div class="header">
			<div class="handle"></div>
			<button class="close" on:click={close} aria-label="Fechar">
				<XIcon />
			</button>
		</div>

		<div class="content">
			{#key mode}
				<div class="mode-wrapper" in:fade={{ duration: 250, delay: 50 }}>
					{#if mode === 'loading'}
						<div class="loading-state">
							<div class="loader-wrap-large"><LoadingIcon /></div>
							<p>Identificando local...</p>
						</div>
					{:else if mode === 'conflict'}
						<div class="conflict-mode">
							<h3>Qual endereço devemos usar?</h3>
							<p class="conflict-desc">O local do clique e sua pesquisa parecem diferentes.</p>

							<div class="conflict-options">
								{#if optionSearch}
									<button class="btn-option" on:click={() => optionSearch && resolveConflict(optionSearch)}>
										<strong>{optionSearch.nome}</strong>
										<small>Sua última pesquisa</small>
									</button>
								{/if}

								{#if optionClick}
									<button class="btn-option" on:click={() => optionClick && resolveConflict(optionClick)}>
										<strong>{optionClick.nome}</strong>
										<small>Detectado no ponto clicado</small>
									</button>
								{/if}
							</div>

							<div class="disclaimer">
								<p>Como utilizamos tecnologias livres, algumas informações do mapa podem estar imprecisas.</p>
								<p>Se nenhum endereço acima estiver correto, pesquise novamente pela rua exata.</p>
							</div>

							<button class="btn-outline full" on:click={searchAgain}> Pesquisar Novamente </button>
						</div>
					{:else if mode === 'list'}
						{#if $selectedLocation.id}
							<ReviewsList localId={$selectedLocation.id} onBack={() => (mode = 'view')} />
						{/if}
					{:else}
						<div class="title-area">
							<h3>{$selectedLocation.nome}</h3>
							<p>{$selectedLocation.cidade || 'Localização selecionada'}</p>
						</div>

						{#if mode === 'view'}
							<LocationSummary onViewReviews={() => (mode = 'list')} onCreateReview={handleStartReview} />
						{:else if mode === 'edit'}
							<ReviewForm onCancel={() => (mode = 'view')} onSuccess={() => (mode = 'view')} />
						{/if}
					{/if}
				</div>
			{/key}
		</div>
	</div>
{/if}

<style>
	/* MANTENHA O CSS ORIGINAL */
	.sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: var(--bg-color);
		border-radius: var(--radius-3) var(--radius-3) 0 0;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
		z-index: var(--z-modal);
		padding-bottom: var(--xl);
		max-height: 85vh;
		overflow-y: auto;
	}
	.sheet.full-height {
		height: 90vh;
		max-height: 90vh;
	}
	.sheet.full-height .content {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.header {
		position: relative;
		display: flex;
		justify-content: center;
		padding: var(--sm);
		padding-bottom: 0;
	}
	.handle {
		width: 40px;
		height: 5px;
		background: #e0e0e0;
		border-radius: 10px;
	}
	.close {
		position: absolute;
		right: var(--md);
		top: var(--sm);
		width: var(--xl);
		height: var(--xl);
		border: none;
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color);
	}
	.close :global(svg) {
		width: 100%;
		height: 100%;
	}
	.content {
		padding: var(--sm) var(--md) var(--md);
		min-height: 160px;
	}
	.title-area h3 {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.2;
	}
	.title-area p {
		margin: 4px 0 var(--sm);
		color: var(--subtext-color);
		font-size: 0.9rem;
	}
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 160px;
		gap: var(--sm);
	}
	.loader-wrap-large {
		width: 48px;
		height: 48px;
		color: var(--primary-color);
	}
	.loading-state p {
		margin: 0;
		font-weight: 500;
		color: var(--subtext-color);
	}
	.conflict-mode {
		padding-top: 0;
		animation: fadeIn 0.3s ease-out;
	}
	.conflict-mode h3 {
		font-size: 1.1rem;
		margin-bottom: 4px;
		color: var(--text-color);
	}
	.conflict-desc {
		font-size: 0.9rem;
		margin-bottom: var(--md);
		color: var(--subtext-color);
	}
	.conflict-options {
		display: flex;
		flex-direction: column;
		gap: var(--sm);
		margin-bottom: var(--md);
	}
	.btn-option {
		background: var(--bg-color);
		border: 1px solid var(--subbg-color);
		padding: var(--sm) var(--md);
		border-radius: var(--radius-2);
		text-align: left;
		display: flex;
		flex-direction: column;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
	}
	.btn-option:hover {
		border-color: var(--primary-color);
		background-color: rgba(84, 145, 244, 0.05); /* Usando cor fixa se a variável RGB não existir */
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
	}
	.btn-option strong {
		font-size: 0.95rem;
		color: var(--text-color);
		display: block;
		margin-bottom: 2px;
	}
	.btn-option small {
		font-size: 0.8rem;
		color: var(--subtext-color);
		font-weight: 500;
	}
	.disclaimer {
		background-color: #fff8e1;
		border: 1px solid #ffe082;
		padding: var(--sm);
		border-radius: var(--radius-2);
		margin-bottom: var(--md);
	}
	.disclaimer p {
		font-size: 0.8rem;
		color: #5d4037;
		margin-bottom: 6px;
		line-height: 1.4;
	}
	.disclaimer p:last-child {
		margin-bottom: 0;
	}
	.btn-outline.full {
		width: 100%;
		background: transparent;
		border: 1px solid var(--subbg-color);
		color: var(--subtext-color);
		padding: var(--sm);
		border-radius: var(--radius-2);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			color 0.2s,
			border-color 0.2s;
	}
	.btn-outline.full:hover {
		color: var(--text-color);
		border-color: var(--text-color);
	}
</style>
