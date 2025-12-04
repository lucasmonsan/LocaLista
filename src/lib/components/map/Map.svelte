<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	// Imports limpos via index da pasta stores
	import { mapView, currentMapCenter, isMapReady, selectedLocation, highlightGeometry, userPosition, setPersistentToast } from '$lib/stores/'

	import { supabase } from '$lib/services/supabase'
	import { reverseGeocode } from '$lib/services/geocoding'
	import { createPinIcon } from '$lib/utils/mapStyles'
	import type { AppLocation, MapViewState } from '$lib/types//'

	let mapContainer: HTMLElement
	let map: any
	let L: any // Leaflet instance

	// Gerenciamento de Memória
	let markersOnMap = new Map<number, any>()
	let tempMarker: any = null
	let currentHighlightLayer: any = null
	let gpsMarker: any = null
	let watchId: number

	// Unsubscribers
	let unsubs: Array<() => void> = []

	isMapReady.set(false)

	onMount(async () => {
		// Importação dinâmica do Leaflet (necessário p/ SvelteKit SSR)
		const leafletModule = await import('leaflet')
		L = leafletModule.default

		initMap()
	})

	onDestroy(() => {
		if (watchId) navigator.geolocation.clearWatch(watchId)
		if (map) map.remove()
		unsubs.forEach(u => u())
		isMapReady.set(false)
	})

	async function initMap() {
		// 1. Configuração Inicial
		const startLat = -23.55052
		const startLon = -46.6333

		map = L.map(mapContainer, { zoomControl: false }).setView([startLat, startLon], 15)

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors',
			maxZoom: 19,
		}).addTo(map)

		L.control.zoom({ position: 'bottomright' }).addTo(map)

		// 2. Inicia GPS
		startGPS()

		// 3. Listeners do Mapa
		map.on('moveend', () => {
			const center = map.getCenter()
			currentMapCenter.set({ lat: center.lat, lon: center.lng })
			loadMarkers()
		})

		map.on('click', handleMapClick)

		// 4. Conecta as Stores (Reatividade)
		setupStoreSubscriptions()

		// Pronto
		// Pequeno delay artificial p/ garantir que tiles carregaram antes de sumir o splash
		setTimeout(() => isMapReady.set(true), 1000)
	}

	function startGPS() {
		if (!('geolocation' in navigator)) return

		watchId = navigator.geolocation.watchPosition(
			pos => {
				const { latitude, longitude } = pos.coords
				userPosition.set({ lat: latitude, lon: longitude })

				// Se for a primeira vez e o mapa ainda estiver no padrão (SP), move pro user
				const current = map.getCenter()
				if (current.lat === -23.55052 && current.lng === -46.6333) {
					map.setView([latitude, longitude], 15)
				}
			},
			err => console.warn('GPS Error:', err.code),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		)
	}

	function setupStoreSubscriptions() {
		// Sincroniza Store -> Mapa (Movimento programático)
		unsubs.push(
			mapView.subscribe((v: MapViewState) => {
				if (!map) return
				const current = map.getCenter()
				const dist = map.distance([v.lat, v.lon], current)

				// Só voa se a distância for relevante ou se tiver um trigger forçado
				if (dist > 10 || v.trigger) {
					map.flyTo([v.lat, v.lon], v.zoom, { animate: true, duration: 1.5 })
				}
			})
		)

		// Renderiza marcador temporário de seleção
		unsubs.push(
			selectedLocation.subscribe((loc: AppLocation | null) => {
				if (!map) return
				if (tempMarker) {
					tempMarker.remove()
					tempMarker = null
				}
				// Se tem local selecionado e NÃO tem ID (é um ponto novo/busca), mostra pin
				if (loc && !loc.id) {
					tempMarker = L.marker([loc.lat, loc.lon], {
						icon: createPinIcon(L, null, true),
						opacity: 0.8,
					}).addTo(map)
				}
			})
		)

		// Renderiza geometria (rua azul)
		unsubs.push(
			highlightGeometry.subscribe((geoJson: any) => {
				if (!map) return
				if (currentHighlightLayer) {
					map.removeLayer(currentHighlightLayer)
					currentHighlightLayer = null
				}
				if (geoJson) {
					currentHighlightLayer = L.geoJSON(geoJson, {
						style: { color: '#5491f4', weight: 6, opacity: 0.5, fillOpacity: 0.2 },
					}).addTo(map)
				}
			})
		)

		// Renderiza bolinha azul do GPS
		unsubs.push(
			userPosition.subscribe(pos => {
				if (!map || !pos) return
				if (gpsMarker) {
					gpsMarker.setLatLng([pos.lat, pos.lon])
				} else {
					gpsMarker = L.circleMarker([pos.lat, pos.lon], {
						radius: 8,
						fillColor: '#3388ff',
						color: '#fff',
						weight: 2,
						opacity: 1,
						fillOpacity: 0.8,
					}).addTo(map)
				}
			})
		)
	}

	async function handleMapClick(e: any) {
		const { lat, lng } = e.latlng

		// Reseta UI
		setPersistentToast(null)

		// Define estado temporário "Buscando..."
		selectedLocation.set({
			id: null,
			nome: 'Buscando endereço...',
			cidade: '',
			lat: lat,
			lon: lng,
		})

		// Usa nosso novo service
		const feature = await reverseGeocode(lat, lng)

		if (!feature) {
			selectedLocation.update(l => (l ? { ...l, nome: 'Local sem nome', cidade: '' } : null))
			return
		}

		selectedLocation.update(l => {
			if (!l) return null
			return {
				...l,
				nome: feature.properties.name || feature.properties.street || 'Local sem nome',
				cidade: feature.properties.city || feature.properties.town || '',
				endereco: feature,
			}
		})
	}

	async function loadMarkers() {
		if (!map) return
		const bounds = map.getBounds()

		const { data, error } = await supabase.rpc('get_locais_in_view', {
			min_lat: bounds.getSouth(),
			min_lon: bounds.getWest(),
			max_lat: bounds.getNorth(),
			max_lon: bounds.getEast(),
		})

		if (!error && data) {
			data.forEach((local: any) => addMarkerToMap(local))
		}
	}

	function addMarkerToMap(local: any) {
		// Evita recriar marker se já existe
		if (markersOnMap.has(local.id)) {
			// Poderíamos atualizar a cor aqui se o rating mudou
			return
		}

		const rating = local.media_rating || 0
		const hasReviews = local.total_reviews > 0

		const marker = L.marker([local.lat, local.lon], {
			icon: createPinIcon(L, hasReviews ? rating : null, false),
		}).addTo(map)

		marker.on('click', (e: any) => {
			L.DomEvent.stopPropagation(e) // Não propaga pro mapa (evita criar tempMarker)
			selectedLocation.set({
				id: local.id,
				nome: local.nome,
				cidade: local.endereco?.properties?.city,
				lat: local.lat,
				lon: local.lon,
				media_rating: local.media_rating,
				total_reviews: local.total_reviews,
			})
		})

		markersOnMap.set(local.id, marker)
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</svelte:head>

<section bind:this={mapContainer}></section>

<style>
	section {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: var(--z-map);
		background: #e5e5e5;
	}
	/* O estilo global do pin pode ficar aqui ou num css global, 
	   mas o L.divIcon precisa dessa classe para tirar o quadrado branco padrão do leaflet */
	:global(.custom-pin-icon) {
		background: transparent !important;
		border: none !important;
	}
</style>
