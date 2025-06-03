// Definição da estrutura para os resultados refinados
interface RefinedSearchResult {
  id: number; // Usaremos o place_id do Nominatim
  lat: string;
  lon: string;
  displayName: string; // O display_name completo do Nominatim
  name: string; // O nome principal (tentaremos obter a tradução via extratags)
  type: string; // O tipo de local (ex: 'village', 'road', 'administrative')
  addressState?: string; // O estado/província (opcional, pois pode não existir)
  addressCountry: string; // O país
}