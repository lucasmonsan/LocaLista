<script lang="ts">
	import { onMount } from 'svelte'
	import { mapView, currentMapCenter, isMapReady, selectedLocation, highlightGeometry } from '$lib/stores'
	import { supabase } from '$lib/supabaseClient'

	// NÃO importamos L aqui em cima para evitar erro de SSR (window is not defined)

	let mapContainer: HTMLElement
	let map: any
	let markersOnMap = new Map<number, any>()
	let tempMarker: any = null
	let currentHighlightLayer: any = null

	isMapReady.set(false)

	onMount(() => {
		// Variáveis de limpeza declaradas fora para o 'return' enxergar
		let unsubscribeMapView: () => void
		let unsubscribeSelection: () => void
		let unsubscribeHighlight: () => void

		const initMap = async () => {
			// 1. Timer Mínimo para Splash
			const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000))

			// 2. Importação Dinâmica do Leaflet (Resolve o erro do Window)
			const L = (await import('leaflet')).default

			// --- SETUP DO MAPA ---
			map = L.map(mapContainer, { zoomControl: false })
			let finalLat = -23.55052
			let finalLon = -46.6333

			// --- GEOLOCALIZAÇÃO ---
			const geoPromise = new Promise<void>(resolve => {
				if ('geolocation' in navigator) {
					navigator.geolocation.getCurrentPosition(
						pos => {
							finalLat = pos.coords.latitude
							finalLon = pos.coords.longitude
							resolve()
						},
						err => {
							console.warn('Geo falhou', err.code)
							resolve()
						},
						{ timeout: 5000, enableHighAccuracy: true }
					)
				} else {
					resolve()
				}
			})

			await geoPromise

			// Configuração Inicial de Visão
			mapView.set({ lat: finalLat, lon: finalLon, zoom: 15, trigger: Date.now() })
			currentMapCenter.set({ lat: finalLat, lon: finalLon })
			map.setView([finalLat, finalLon], 15)
			L.control.zoom({ position: 'bottomright' }).addTo(map)

			if (finalLat !== -23.55052) {
				L.circleMarker([finalLat, finalLon], {
					radius: 8,
					fillColor: '#3388ff',
					color: '#fff',
					weight: 2,
					opacity: 1,
					fillOpacity: 0.8,
				}).addTo(map)
			}

			// --- TILES ---
			const tilesPromise = new Promise<void>(resolve => {
				const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 19,
				})
				tiles.on('load', () => resolve())
				tiles.addTo(map)
			})

			await Promise.all([minTimePromise, tilesPromise])
			isMapReady.set(true)

			// ============================================================
			// FUNÇÕES INTERNAS (Agora elas acessam o 'L' corretamente)
			// ============================================================

			// A. Carregar Pins do Banco (Laranjas)
			const loadMarkers = async () => {
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

			const addMarkerToMap = (local: any) => {
				if (markersOnMap.has(local.id)) return

				const marker = L.circleMarker([local.lat, local.lon], {
					radius: 6,
					fillColor: '#ff5733',
					color: '#fff',
					weight: 2,
					opacity: 1,
					fillOpacity: 0.9,
				}).addTo(map)

				marker.on('click', (e: any) => {
					selectedLocation.set({
						id: local.id,
						nome: local.nome,
						cidade: local.endereco?.properties?.city,
						lat: local.lat,
						lon: local.lon,
					})
					L.DomEvent.stopPropagation(e)
				})
				marker.bindTooltip(local.nome, { direction: 'top', offset: [0, -5] })
				markersOnMap.set(local.id, marker)
			}

			// B. Listener: Pin Fantasma (Cinza)
			unsubscribeSelection = selectedLocation.subscribe(loc => {
				if (!map) return
				if (tempMarker) {
					tempMarker.remove()
					tempMarker = null
				}
				if (!loc || loc.id) return // Se não tem loc ou já é salvo (tem ID), sai

				tempMarker = L.circleMarker([loc.lat, loc.lon], {
					radius: 8,
					fillColor: '#999',
					color: '#fff',
					weight: 2,
					opacity: 1,
					fillOpacity: 0.8,
					dashArray: '4, 4',
				}).addTo(map)
			})

			// C. Listener: Destaque da Rua (Azul)
			// MOVIDO PARA CÁ PARA ACESSAR 'L'
			unsubscribeHighlight = highlightGeometry.subscribe(geoJson => {
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

			// D. Evento: Clique no Mapa
			map.on('click', async (e: any) => {
				const { lat, lng } = e.latlng

				// 1. FEEDBACK INSTANTÂNEO (Optimistic UI)
				// Define o local imediatamente com texto provisório
				// Isso faz a Bottom Sheet subir na hora
				selectedLocation.set({
					id: null,
					nome: 'Buscando endereço...',
					cidade: '',
					endereco: null,
					lat: lat,
					lon: lng,
				})

				try {
					// 2. Busca o endereço real (Pode demorar um pouco)
					const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`)
					const data = await response.json()

					if (!data.features || data.features.length === 0) {
						// Se não achou endereço, atualiza o nome
						selectedLocation.update(l => ({
							...l,
							nome: 'Local sem nome',
							cidade: '',
						}))
						return
					}

					const feat = data.features[0]
					const nome = feat.properties.name || feat.properties.street || 'Local sem nome'
					const cidade = feat.properties.city || feat.properties.town

					// 3. ATUALIZA A STORE COM DADOS REAIS
					// O Svelte vai trocar o texto "Buscando..." pelo nome da rua automaticamente
					selectedLocation.update(l => ({
						...l,
						nome: nome,
						cidade: cidade,
						endereco: feat,
					}))
				} catch (err) {
					console.error(err)
					selectedLocation.update(l => ({ ...l, nome: 'Erro ao carregar endereço' }))
				}
			})

			// E. Eventos de Movimento
			loadMarkers()
			map.on('moveend', () => {
				const center = map.getCenter()
				currentMapCenter.set({ lat: center.lat, lon: center.lng })
				loadMarkers()
			})

			unsubscribeMapView = mapView.subscribe(value => {
				if (!map) return
				const current = map.getCenter()
				const dist = map.distance([value.lat, value.lon], current)
				if (dist > 10) map.flyTo([value.lat, value.lon], value.zoom, { animate: true, duration: 1.5 })
			})
		}

		initMap()

		// Limpeza ao desmontar componente
		return () => {
			if (unsubscribeMapView) unsubscribeMapView()
			if (unsubscribeSelection) unsubscribeSelection()
			if (unsubscribeHighlight) unsubscribeHighlight()
			if (map) map.remove()
			isMapReady.set(false)
		}
	})
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
</style>
