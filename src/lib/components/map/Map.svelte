<script lang="ts">
	import { onMount } from 'svelte'
	// Adicionado userPosition aqui
	import { mapView, currentMapCenter, isMapReady, selectedLocation, highlightGeometry, userPosition, setPersistentToast } from '$lib/stores'
	import { supabase } from '$lib/supabaseClient'

	let mapContainer: HTMLElement
	let map: any
	let markersOnMap = new Map<number, any>()
	let tempMarker: any = null
	let currentHighlightLayer: any = null
	let gpsMarker: any = null // Marcador da bolinha azul

	isMapReady.set(false)

	onMount(() => {
		let unsubscribeMapView: () => void
		let unsubscribeSelection: () => void
		let unsubscribeHighlight: () => void
		let unsubscribeUserPosition: () => void // Novo
		let watchId: number // ID do rastreador GPS

		const initMap = async () => {
			const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000))

			const L = (await import('leaflet')).default

			// --- HELPERS ---
			const getPinIcon = (rating: number | null, isTemp = false) => {
				let color = '#6b7280'
				let stroke = '#ffffff'
				if (!isTemp && rating !== null) {
					if (rating >= 4.0) color = '#10b981'
					else if (rating >= 2.5) color = '#f59e0b'
					else color = '#ef4444'
				}
				const svgHtml = `
            <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <circle cx="12" cy="8" r="3.5" fill="white"/>
            </svg>
        `
				return L.divIcon({ className: 'custom-pin-icon', html: svgHtml, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] })
			}

			// --- MAP SETUP ---
			map = L.map(mapContainer, { zoomControl: false })

			// Posição inicial padrão (SP)
			let startLat = -23.55052
			let startLon = -46.6333

			// --- GEOLOCALIZAÇÃO CONTÍNUA ---
			// Usamos uma Promise para esperar a PRIMEIRA leitura antes de tirar a Splash
			const geoPromise = new Promise<void>(resolve => {
				if ('geolocation' in navigator) {
					watchId = navigator.geolocation.watchPosition(
						pos => {
							const { latitude, longitude } = pos.coords

							// 1. Atualiza a store global (O Footer vai ler isso)
							userPosition.set({ lat: latitude, lon: longitude })

							// 2. Se for a primeira vez que rodamos, atualiza o centro de partida
							if (startLat === -23.55052) {
								startLat = latitude
								startLon = longitude
								resolve() // Libera a splash
							}
						},
						err => {
							console.warn('GPS Error:', err.code)
							resolve() // Libera a splash mesmo com erro
						},
						{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
					)
				} else {
					resolve()
				}
			})

			// Espera GPS (ou timeout) + Tempo Mínimo
			await Promise.all([geoPromise, minTimePromise])

			// Configura visão inicial
			mapView.set({ lat: startLat, lon: startLon, zoom: 15, trigger: Date.now() })
			currentMapCenter.set({ lat: startLat, lon: startLon })
			map.setView([startLat, startLon], 15)
			L.control.zoom({ position: 'bottomright' }).addTo(map)

			// --- TILES ---
			const tilesPromise = new Promise<void>(resolve => {
				const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 19,
				})
				tiles.on('load', () => resolve())
				tiles.addTo(map)
			})

			await tilesPromise
			isMapReady.set(true)

			// --- FUNÇÕES INTERNAS ---

			// Desenhar bolinha azul do usuário (Reage à store userPosition)
			unsubscribeUserPosition = userPosition.subscribe(pos => {
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

			const loadMarkers = async () => {
				if (!map) return
				const bounds = map.getBounds()
				const { data, error } = await supabase.rpc('get_locais_in_view', {
					min_lat: bounds.getSouth(),
					min_lon: bounds.getWest(),
					max_lat: bounds.getNorth(),
					max_lon: bounds.getEast(),
				})
				if (!error && data) data.forEach((local: any) => addMarkerToMap(local))
			}

			const addMarkerToMap = (local: any) => {
				if (markersOnMap.has(local.id)) {
					// Atualiza cor se mudou
					const rating = local.media_rating || 0
					const hasReviews = local.total_reviews > 0
					const marker = markersOnMap.get(local.id)
					marker.setIcon(getPinIcon(hasReviews ? rating : null, false))
					return
				}

				const rating = local.media_rating || 0
				const hasReviews = local.total_reviews > 0

				const marker = L.marker([local.lat, local.lon], {
					icon: getPinIcon(hasReviews ? rating : null, false),
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
				markersOnMap.set(local.id, marker)
			}

			// --- LISTENERS ---

			unsubscribeSelection = selectedLocation.subscribe(loc => {
				if (!map) return
				if (tempMarker) {
					tempMarker.remove()
					tempMarker = null
				}
				if (!loc || loc.id) return
				tempMarker = L.marker([loc.lat, loc.lon], {
					icon: getPinIcon(null, true),
					opacity: 0.8,
				}).addTo(map)
			})

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

			map.on('click', async (e: any) => {
				const { lat, lng } = e.latlng
				setPersistentToast(null)
				selectedLocation.set({ id: null, nome: 'Buscando endereço...', cidade: '', endereco: null, lat: lat, lon: lng })
				try {
					const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`)
					const data = await response.json()
					if (!data.features || data.features.length === 0) {
						selectedLocation.update(l => ({ ...l, nome: 'Local sem nome', cidade: '' }))
						return
					}
					const feat = data.features[0]
					selectedLocation.update(l => ({
						...l,
						nome: feat.properties.name || feat.properties.street || 'Local sem nome',
						cidade: feat.properties.city || feat.properties.town,
						endereco: feat,
					}))
				} catch (err) {
					console.error(err)
				}
			})

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

		return () => {
			if (unsubscribeMapView) unsubscribeMapView()
			if (unsubscribeSelection) unsubscribeSelection()
			if (unsubscribeHighlight) unsubscribeHighlight()
			if (unsubscribeUserPosition) unsubscribeUserPosition()
			if (watchId) navigator.geolocation.clearWatch(watchId) // Para o GPS ao sair
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
	:global(.custom-pin-icon) {
		background: transparent !important;
		border: none !important;
	}
</style>
