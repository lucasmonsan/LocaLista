import type { PhotonFeature } from '$lib/types/';

const PHOTON_API = 'https://photon.komoot.io';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export async function searchAddress(
  query: string,
  lat: number,
  lon: number
): Promise<PhotonFeature[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      lat: lat.toFixed(6),
      lon: lon.toFixed(6),
      limit: '8'
    });

    const res = await fetch(`${PHOTON_API}/api/?${params}`);
    const data = await res.json();
    return data.features || [];
  } catch (err) {
    console.error('Erro na busca:', err);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<PhotonFeature | null> {
  try {
    const res = await fetch(`${PHOTON_API}/reverse?lon=${lon}&lat=${lat}`);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      return data.features[0];
    }
    return null;
  } catch (err) {
    console.error('Erro no reverse geocode:', err);
    return null;
  }
}

export async function getOsmGeometry(osmType: string, osmId: number): Promise<any | null> {
  try {
    // Nominatim requer user-agent ou referer em produção, mas funciona ok para dev
    const typeMap: Record<string, string> = { 'N': 'N', 'W': 'W', 'R': 'R' };
    const safeType = typeMap[osmType.toUpperCase()];

    if (!safeType) return null;

    const url = `${NOMINATIM_API}/lookup?osm_ids=${safeType}${osmId}&polygon_geojson=1&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0 && data[0].geojson) {
      return data[0].geojson;
    }
    return null;
  } catch (err) {
    console.error('Erro ao buscar geometria:', err);
    return null;
  }
}