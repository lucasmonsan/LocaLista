<script lang="ts">
	import { slide } from 'svelte/transition'
	import SearchIcon from '$lib/icons/SearchIcon.svelte'
	import XIcon from '$lib/icons/XIcon.svelte'
	import GpsIcon from '$lib/icons/GpsIcon.svelte'
	import UserIcon from '$lib/icons/UserIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	import SearchResults from '$lib/components/layout/SearchResults.svelte'
	import { mapView, currentMapCenter, selectedLocation, highlightGeometry, toastMessage, lastSearchedLocation } from '$lib/stores'

	let searchInput = ''
	let inputRef: HTMLInputElement
	let isLoading = false
	let results: any[] = []
	let searchError = ''
	let isFocused = false

	const handleSearch = async () => {
		if (searchInput.length < 3 || isLoading) return

		isLoading = true
		results = []
		searchError = ''

		try {
			const center = $currentMapCenter
			const params = new URLSearchParams({
				q: searchInput,
				lat: center.lat.toFixed(6),
				lon: center.lon.toFixed(6),
				limit: '8',
			})

			const response = await fetch(`https://photon.komoot.io/api/?${params}`)
			if (!response.ok) throw new Error('Erro API')

			const data = await response.json()

			if (data.features && data.features.length > 0) {
				const seen = new Set()

				results = data.features
					.filter((f: any) => {
						if (f.properties.countrycode !== 'BR') return false
						const key = `${f.properties.name}-${f.properties.city || f.properties.town}`
						if (seen.has(key)) return false
						seen.add(key)
						return true
					})
					.slice(0, 5)

				if (results.length === 0) searchError = 'Nenhum local relevante encontrado.'
			} else {
				searchError = 'Nenhum local encontrado.'
			}
		} catch (error) {
			console.error(error)
			searchError = 'Erro ao buscar.'
		} finally {
			isLoading = false
		}
	}

	async function onSelectResult(item: any) {
		const [lon, lat] = item.geometry.coordinates
		const nomeOficial = item.properties.name || item.properties.street
		const cidade = item.properties.city || item.properties.town

		// 1. UI Updates
		searchInput = cidade ? `${nomeOficial}, ${cidade}` : nomeOficial
		inputRef.blur()
		results = []

		// Move mapa
		mapView.set({ lat, lon, zoom: 17, trigger: Date.now() })

		// 2. Highlight da Rua (Nominatim)
		const osmType = item.properties.osm_type
		const osmId = item.properties.osm_id
		highlightGeometry.set(null)

		// NOVO: Salva a intenção de busca
		lastSearchedLocation.set(item)

		if (osmType && osmId) {
			try {
				const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=${osmType.toUpperCase()}${osmId}&polygon_geojson=1&format=json`
				const resp = await fetch(url)
				const data = await resp.json()
				if (data && data.length > 0 && data[0].geojson) {
					highlightGeometry.set(data[0].geojson)
				}
			} catch (err) {
				console.error('Erro ao buscar geometria:', err)
			}
		}

		// 3. Decisão UX: Pin ou Toast?
		if (osmType === 'N') {
			// Nó específico (Loja, Prédio): Seleciona
			selectedLocation.set({
				id: null,
				nome: nomeOficial || 'Local selecionado',
				cidade: cidade,
				endereco: item,
				lat: lat,
				lon: lon,
			})
		} else {
			// Rua ou Bairro: Apenas avisa
			selectedLocation.set(null)
			toastMessage.set('📍 Local encontrado! Toque no ponto exato do imóvel para avaliar.')
		}
	}

	function clearSearch() {
		searchInput = ''
		results = []
		searchError = ''
		highlightGeometry.set(null)
		inputRef.focus()
	}
</script>

<footer class:hidden={$selectedLocation !== null}>
	<div class="expand-wrapper">
		{#if results.length > 0}
			<div class="expand-content" transition:slide={{ duration: 250 }}>
				<SearchResults {results} onSelect={onSelectResult} />
			</div>
		{:else if isFocused && results.length === 0 && !searchError}
			<div class="expand-content tips" transition:slide={{ duration: 250 }}>
				<p>💡 <strong>Dicas de pesquisa:</strong></p>
				<ul>
					<li>Busque por rua e cidade.</li>
					<li>Ruas sem numeração? Adicione na criação.</li>
				</ul>
			</div>
		{:else if searchError}
			<div class="expand-content error" transition:slide>
				<small>{searchError}</small>
			</div>
		{/if}
	</div>

	<div class="controls-row">
		<button class="icon-btn" aria-label="Perfil">
			<UserIcon />
		</button>

		<div class="search-input-group">
			<input
				bind:this={inputRef}
				type="text"
				placeholder="Pesquisar..."
				bind:value={searchInput}
				on:keydown={e => e.key === 'Enter' && handleSearch()}
				on:focus={() => (isFocused = true)}
				on:blur={() => setTimeout(() => (isFocused = false), 200)}
			/>
			<button class="action-btn" on:mousedown|preventDefault on:click={searchInput ? clearSearch : handleSearch}>
				{#if isLoading}
					<div class="loader-wrap"><LoadingIcon /></div>
				{:else if searchInput}
					<XIcon />
				{:else}
					<SearchIcon />
				{/if}
			</button>
		</div>

		<button class="icon-btn" aria-label="GPS">
			<GpsIcon />
		</button>
	</div>
</footer>

<style>
	footer {
		position: fixed;
		bottom: var(--lg);
		z-index: var(--z-search);

		width: 100%;
		max-width: calc(var(--xxxl) * 10);
		padding: var(--padd-component);

		/* Layout Vertical: Expansão em cima, Controles embaixo */
		display: flex;
		flex-direction: column;
		gap: var(--xs); /* Espaço entre a lista e a barra */

		transition: transform var(--normal);

		@media (max-width: 640px) {
			max-width: calc(100% - var(--xl));
		}
	}

	footer.hidden {
		transform: translateY(150%);
	}

	/* --- Linha Principal (Dock) --- */
	.controls-row {
		display: flex;
		align-items: center;
		gap: var(--xs);
		height: var(--xxxxl);
	}

	/* Botões Laterais (Quadrados/Redondos) */
	.icon-btn {
		width: var(--xxxxl); /* Largura fixa */
		height: 100%; /* Altura total da linha */
		padding: var(--xs);

		background-color: var(--bg-color);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-black);
		border: none;

		display: flex;
		align-items: center;
		justify-content: center;
		transition: background var(--fast);
	}
	.icon-btn:active {
		transform: scale(0.95);
	}

	/* Grupo Central de Busca */
	.search-input-group {
		flex: 1; /* Ocupa todo o espaço restante */
		height: 100%;

		background-color: var(--bg-color);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-black);

		display: flex;
		align-items: center;
		padding-left: var(--sm);
		overflow: hidden; /* Para o input não vazar */
	}

	input {
		flex: 1;
		height: 100%;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: var(--text-color);
		min-width: 0; /* Fix flexbox shrinking issues */
	}

	.action-btn {
		width: var(--xxxxl); /* Quadrado na ponta direita */
		height: 100%;
		padding: var(--xs);
		border: none;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--subtext-color);
	}

	/* --- Conteúdo Expansível (Resultados) --- */
	.expand-wrapper {
		width: 100%;
		/* Como o footer é flex-column, isso fica em cima naturalmente */
	}

	.expand-content {
		background: var(--bg-color);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-black);
		overflow: hidden;
	}

	.tips {
		padding: var(--sm);
		font-size: 0.9rem;
		color: var(--subtext-color);
	}
	.tips ul {
		margin: 0;
		padding-left: var(--md);
		margin-top: var(--xs);
	}
	.tips li {
		margin-bottom: 4px;
	}

	.error {
		padding: var(--sm);
		color: #c62828;
		text-align: center;
		background: #ffcdd2;
	}

	/* Ajuste de tamanho do loader */
	.loader-wrap {
		width: 100%;
		height: 100%;
	}
</style>
