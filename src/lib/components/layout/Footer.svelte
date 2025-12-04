<script lang="ts">
	import { slide } from 'svelte/transition'

	// Ícones UI
	import SearchIcon from '$lib/icons/SearchIcon.svelte'
	import XIcon from '$lib/icons/XIcon.svelte'
	import GpsIcon from '$lib/icons/GpsIcon.svelte'
	import UserIcon from '$lib/icons/UserIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	import SearchResults from '$lib/components/layout/SearchResults.svelte'

	// Stores e Services
	import { mapView, currentMapCenter, selectedLocation, highlightGeometry, lastSearchedLocation, isProfileOpen, userPosition, user, setPersistentToast } from '$lib/stores/' // Mantendo a barra final que funcionou pra você

	import { searchAddress, getOsmGeometry } from '$lib/services/geocoding'
	import type { PhotonFeature } from '$lib/types//'

	let searchInput = ''
	let inputRef: HTMLInputElement
	let isLoading = false
	let results: PhotonFeature[] = []
	let searchError = ''
	let isFocused = false
	let isGpsLoading = false

	// --- LÓGICA DE UI ---
	function getUserAvatar() {
		if (!$user) return null
		const avatar = $user.user_metadata?.avatar_url
		if (avatar) return { type: 'image', src: avatar }

		const name = $user.user_metadata?.full_name || $user.email
		const initial = name ? name[0].toUpperCase() : '?'
		return { type: 'text', content: initial }
	}

	let isGpsActive = false
	$: if ($userPosition && $currentMapCenter) {
		const latDiff = Math.abs($userPosition.lat - $currentMapCenter.lat)
		const lonDiff = Math.abs($userPosition.lon - $currentMapCenter.lon)
		isGpsActive = latDiff < 0.0005 && lonDiff < 0.0005
	}

	// --- AÇÕES ---
	const handleGPS = () => {
		isGpsLoading = true

		if ($userPosition) {
			// Se já temos posição, é instantâneo
			mapView.set({ lat: $userPosition.lat, lon: $userPosition.lon, zoom: 17, trigger: Date.now() })
			currentMapCenter.set({ lat: $userPosition.lat, lon: $userPosition.lon })
			isGpsLoading = false
		} else {
			// Solicita ao navegador (fallback)
			navigator.geolocation.getCurrentPosition(
				pos => {
					const { latitude, longitude } = pos.coords
					userPosition.set({ lat: latitude, lon: longitude })
					mapView.set({ lat: latitude, lon: longitude, zoom: 17, trigger: Date.now() })
					isGpsLoading = false
				},
				err => {
					console.error(err)
					alert('Não foi possível obter sua localização.')
					isGpsLoading = false
				},
				{ enableHighAccuracy: true }
			)
		}
	}

	const handleSearch = async () => {
		if (searchInput.length < 3 || isLoading) return
		isLoading = true
		results = []
		searchError = ''

		try {
			// REFACTOR: Usa o serviço centralizado
			const rawResults = await searchAddress(searchInput, $currentMapCenter.lat, $currentMapCenter.lon)

			if (rawResults.length > 0) {
				// Filtra duplicatas e limita
				const seen = new Set()
				results = rawResults
					.filter(f => {
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
			searchError = 'Erro ao buscar.'
		} finally {
			isLoading = false
		}
	}

	async function onSelectResult(item: PhotonFeature) {
		const [lon, lat] = item.geometry.coordinates
		const nomeOficial = item.properties.name || item.properties.street || 'Local'
		const cidade = item.properties.city || item.properties.town || ''

		searchInput = cidade ? `${nomeOficial}, ${cidade}` : nomeOficial
		inputRef.blur()
		results = []

		mapView.set({ lat, lon, zoom: 17, trigger: Date.now() })

		// REFACTOR: Lógica de Highlight isolada no serviço
		const osmType = item.properties.osm_type
		const osmId = item.properties.osm_id

		highlightGeometry.set(null)
		lastSearchedLocation.set(item)

		if (osmType && osmId) {
			const geometry = await getOsmGeometry(osmType, osmId)
			if (geometry) highlightGeometry.set(geometry)
		}

		if (osmType === 'N') {
			// É um Node (Ponto exato), abre review direto
			selectedLocation.set({
				id: null,
				nome: nomeOficial,
				cidade: cidade,
				endereco: item,
				lat: lat,
				lon: lon,
			})
		} else {
			// É uma Rua/Bairro, pede pro usuário clicar no lote
			selectedLocation.set(null)
			setPersistentToast('📍 Local encontrado! Toque no ponto exato do imóvel para avaliar.')
		}
	}

	function clearSearch() {
		searchInput = ''
		results = []
		searchError = ''
		highlightGeometry.set(null)
		setPersistentToast(null)
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
			<div class="expand-content error" transition:slide><small>{searchError}</small></div>
		{/if}
	</div>

	<div class="controls-row">
		<button class="icon-btn" aria-label="Perfil" on:click={() => ($isProfileOpen = true)}>
			{#if $user}
				{@const avatar = getUserAvatar()}
				{#if avatar?.type === 'image'}
					<img src={avatar.src} alt="Avatar" class="avatar-img" />
				{:else}
					<div class="avatar-text">{avatar?.content}</div>
				{/if}
			{:else}
				<UserIcon />
			{/if}
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

		<button class="icon-btn gps-btn" class:active={isGpsActive} aria-label="GPS" on:click={handleGPS}>
			{#if isGpsLoading}
				<div class="loader-wrap"><LoadingIcon /></div>
			{:else}
				<GpsIcon />
			{/if}
		</button>
	</div>
</footer>

<style>
	/* Mantenha seu CSS original aqui (não mudei nada no estilo) */
	footer {
		position: fixed;
		bottom: var(--lg);
		z-index: var(--z-search);
		width: 100%;
		max-width: calc(var(--xxxl) * 10);
		padding: var(--padd-component);
		display: flex;
		flex-direction: column;
		gap: var(--xs);
		transition: transform var(--normal);
		@media (max-width: 640px) {
			max-width: calc(100% - var(--xl));
		}
	}
	footer.hidden {
		transform: translateY(150%);
	}
	.controls-row {
		display: flex;
		align-items: center;
		gap: var(--xs);
		height: var(--xxxxl);
	}
	.icon-btn {
		width: var(--xxxxl);
		height: 100%;
		padding: 0;
		border-radius: var(--radius-2);
		background-color: var(--bg-color);
		box-shadow: var(--shadow-black);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background var(--fast),
			color var(--fast);
		overflow: hidden;
		flex-shrink: 0;
		position: relative;
	}
	.icon-btn:active {
		transform: scale(0.95);
	}
	.gps-btn.active {
		color: var(--primary-color);
	}
	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.avatar-text {
		width: 100%;
		height: 100%;
		background-color: var(--primary-color);
		color: white;
		font-weight: bold;
		font-size: 1.1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.search-input-group {
		flex: 1;
		height: 100%;
		background-color: var(--bg-color);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-black);
		display: flex;
		align-items: center;
		padding-left: var(--sm);
		overflow: hidden;
	}
	input {
		flex: 1;
		height: 100%;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: var(--text-color);
		min-width: 0;
	}
	.action-btn {
		width: var(--xxxxl);
		height: 100%;
		padding: 0;
		border: none;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--subtext-color);
	}
	.action-btn :global(svg) {
		width: 24px;
		height: 24px;
	}
	.expand-wrapper {
		width: 100%;
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
	.loader-wrap {
		width: 24px;
		height: 24px;
	}
</style>
