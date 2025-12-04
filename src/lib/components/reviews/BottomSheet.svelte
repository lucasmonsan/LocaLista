<script lang="ts">
	import { selectedLocation, lastSearchedLocation, user, isProfileOpen } from '$lib/stores'
	import { fly, fade } from 'svelte/transition'
	import XIcon from '$lib/icons/XIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	import LocationSummary from '$lib/components/reviews/LocationSummary.svelte'
	import ReviewForm from '$lib/components/reviews/ReviewForm.svelte'
	import ReviewsList from '$lib/components/reviews/ReviewsList.svelte'

	let mode: 'view' | 'edit' | 'list' | 'conflict' | 'loading' = 'view'

	let optionSearch: any = null
	let optionClick: any = null

	// Flag para impedir que o bloco reativo sobrescreva nossa decisão
	let ignoreNextUpdate = false

	// Lógica Reativa (Controladora de Estado)
	$: if ($selectedLocation) {
		if (ignoreNextUpdate) {
			// Se a flag estiver ativa, reseta ela e NÃO muda o modo.
			// Mantém o modo que definimos manualmente (ex: 'edit').
			ignoreNextUpdate = false
		} else {
			// Fluxo Normal (Automático)
			if ($selectedLocation.id) {
				mode = 'view'
			} else if ($selectedLocation.nome === 'Buscando endereço...') {
				mode = 'loading'
			} else {
				checkConflict()
			}
		}
	}

	function checkConflict() {
		const clickedName = $selectedLocation.nome
		const normClick = clickedName?.trim().toLowerCase()

		let hasConflict = false
		optionClick = $selectedLocation
		optionSearch = null

		if ($lastSearchedLocation) {
			const searchedName = $lastSearchedLocation.properties.name || $lastSearchedLocation.properties.street
			const normSearch = searchedName?.trim().toLowerCase()

			if (normSearch && normSearch !== normClick && normClick !== 'local sem nome') {
				hasConflict = true
				optionSearch = {
					...$selectedLocation, // Mantém lat/lon do clique
					nome: searchedName, // Usa nome da pesquisa
					cidade: $lastSearchedLocation.properties.city || $lastSearchedLocation.properties.town,
					endereco: $lastSearchedLocation,
				}
			}
		}

		if (hasConflict) {
			mode = 'conflict'
		} else {
			mode = 'view'
		}
	}

	// Função auxiliar para verificar login antes de editar
	function handleStartReview() {
		if (!$user) {
			alert('Você precisa entrar na sua conta para avaliar.')
			isProfileOpen.set(true) // Abre a tela de login
			return
		}
		// Se tiver logado, libera o formulário
		mode = 'edit'
	}

	function resolveConflict(chosenLocation: any) {
		selectedLocation.set(chosenLocation)

		// Verifica login antes de ir pro form
		if (!$user) {
			alert('Endereço definido. Faça login para continuar a avaliação.')
			isProfileOpen.set(true)
			// Mantém no modo view para o usuário não perder a localização
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
									<button class="btn-option" on:click={() => resolveConflict(optionSearch)}>
										<strong>{optionSearch.nome}</strong>
										<small>Sua última pesquisa</small>
									</button>
								{/if}

								<button class="btn-option" on:click={() => resolveConflict(optionClick)}>
									<strong>{optionClick.nome}</strong>
									<small>Detectado no ponto clicado</small>
								</button>
							</div>

							<div class="disclaimer">
								<p>Como utilizamos tecnologias livres, algumas informações do mapa podem estar imprecisas.</p>
								<p>Se nenhum endereço acima estiver correto, pesquise novamente pela rua exata.</p>
							</div>

							<button class="btn-outline full" on:click={searchAgain}> Pesquisar Novamente </button>
						</div>
					{:else if mode === 'list'}
						<ReviewsList localId={$selectedLocation.id} onBack={() => (mode = 'view')} />
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

		/* Removemos o 'transition: height' que causava lag com 'auto' */
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
		padding: var(--sm); /* Reduzido de --md para --sm */
		padding-bottom: 0; /* Remove espaço extra embaixo do handle */
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
		padding: var(--sm) var(--md) var(--md); /* Reduzido top para --sm */

		/* MUDANÇA CRÍTICA: Reduzimos de 250px para 160px */
		/* É altura suficiente para o Loading não pular, mas não deixa gigante */
		min-height: 160px;
	}

	.title-area h3 {
		margin: 0;
		font-size: 1.1rem; /* Leve redução */
		line-height: 1.2;
	}
	.title-area p {
		margin: 4px 0 var(--sm); /* Margens menores */
		color: var(--subtext-color);
		font-size: 0.9rem;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		/* Força ocupar exatamente a altura mínima para centralizar bem */
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

	/* Conflict Styles */
	.conflict-mode {
		padding-top: 0;
		/* Animação suave */
		animation: fadeIn 0.3s ease-out;
	}

	.conflict-mode h3 {
		font-size: 1.1rem; /* Menor e mais elegante */
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
		gap: var(--sm); /* Aumentei o espaço entre os botões */
		margin-bottom: var(--md);
	}

	/* Botões de Opção (Card Style) */
	.btn-option {
		background: var(--bg-color);
		border: 1px solid var(--subbg-color);
		padding: var(--sm) var(--md); /* Mais compacto verticalmente */
		border-radius: var(--radius-2);
		text-align: left;
		display: flex;
		flex-direction: column;
		cursor: pointer;
		transition: all 0.2s ease;

		/* Sombra suave para dar profundidade */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
	}

	.btn-option:hover {
		border-color: var(--primary-color);
		background-color: rgba(var(--primary-rgb), 0.05); /* Se tiver variavel RGB, senao use cor fixa clara */
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
	}

	.btn-option strong {
		font-size: 0.95rem; /* Levemente menor */
		color: var(--text-color);
		display: block;
		margin-bottom: 2px;
	}

	.btn-option small {
		font-size: 0.8rem;
		color: var(--subtext-color);
		font-weight: 500;
	}

	/* Caixa de Aviso (Disclaimer) */
	.disclaimer {
		background-color: #fff8e1; /* Amarelo muito suave */
		border: 1px solid #ffe082; /* Borda sutil */
		padding: var(--sm);
		border-radius: var(--radius-2);
		margin-bottom: var(--md);
	}

	.disclaimer p {
		font-size: 0.8rem;
		color: #5d4037; /* Marrom escuro para leitura */
		margin-bottom: 6px;
		line-height: 1.4;
	}
	.disclaimer p:last-child {
		margin-bottom: 0;
	}

	/* Botão "Pesquisar Novamente" */
	.btn-outline.full {
		width: 100%;
		background: transparent;
		border: 1px solid var(--subbg-color); /* Borda mais fina */
		color: var(--subtext-color); /* Cor mais discreta para ação secundária */
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
