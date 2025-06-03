export interface NominatimAddress {
  city?: string;
  suburb?: string;
  state?: string;
  country?: string;
  [key: string]: any;
}

export interface NominatimResult {
  display_name: string;
  name?: string; // Adicione esta linha
  lat: string;
  lon: string;
  type?: string;
  addresstype?: string;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
    state?: string;
    country?: string;
    [key: string]: any;
  };
}