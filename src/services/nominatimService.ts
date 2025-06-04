import L from 'leaflet';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?format=json&limit=15&extratags=1&q=';

// Interface para o resultado processado que seu app usará
export interface ProcessedNominatimResult {
  id: number; // Usaremos place_id do Nominatim, que é um bom candidato para key
  displayName: string;
  coordinates: L.LatLngTuple;
}

// Interface para o item como vem da API do Nominatim
interface NominatimAPIResponseItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  // Outras propriedades da API podem ser adicionadas aqui se necessário
}

export const searchLocation = async (query: string): Promise<ProcessedNominatimResult[] | null> => {
  try {
    // Adicionar &limit=5 ou similar se quiser limitar o número de resultados da API
    const response = await fetch(`${NOMINATIM_BASE_URL}${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error('Nominatim API error:', response.statusText);
      return null;
    }
    const data: NominatimAPIResponseItem[] = await response.json();
    if (data && data.length > 0) {
      // Mapeia os dados da API para a estrutura ProcessedNominatimResult
      return data.map(item => ({
        id: item.place_id,
        displayName: item.display_name,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
      }));
    }
    return null;
  } catch (error) {
    console.error('Error searching location:', error);
    return null;
  }
};