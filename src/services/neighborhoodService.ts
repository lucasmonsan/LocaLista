import { ID, Query, type Models } from 'appwrite';
import { databases } from './appwrite';
import { DATABASE_ID, NEIGHBORHOODS_ID } from './appwrite';
import type { Neighborhood, NominatimResult } from '../types';
import { getOrCreateCity } from './cityService';

// Função auxiliar para normalização (mantida igual)
function normalizeId(...parts: string[]): string {
  return parts
    .filter(part => part && part.trim() !== '')
    .map(part => part.toLowerCase().replace(/\s+/g, '-'))
    .join('_');
}

const getCityName = (nominatimData: NominatimResult): string => {
  const { addresstype, address = {} } = nominatimData;

  // Usa o padrão addresstype -> address[type]
  if (addresstype && address[addresstype]) {
    return address[addresstype];
  }

  // Fallback hierárquico
  return address.municipality ||
    address.town ||
    address.city_district ||
    nominatimData.name ||
    nominatimData.display_name.split(',')[0].trim();
};

const getNeighborhoodName = (nominatimData: NominatimResult): string => {
  return nominatimData.address?.suburb ||
    (nominatimData.addresstype === 'suburb' ? nominatimData.name : undefined) ||
    getCityName(nominatimData);
};

// 2. Atualize a chamada dentro de getOrCreate (código existente)
export async function getOrCreate(nominatimData: NominatimResult): Promise<Neighborhood | null> {
  // Extração MELHORADA da cidade
  const cityName = nominatimData.address?.municipality || nominatimData.name || 'Unknown';
  const state = nominatimData.address?.state || '';
  const country = nominatimData.address?.country || '';

  // Geração do cityId (sem criar documento ainda)
  const cityId = normalizeId(cityName, state, country);

  // Processamento do bairro
  const neighborhoodName = nominatimData.address?.suburb || cityName;
  const neighborhoodId = normalizeId(cityId, neighborhoodName);

  try {
    // 1. Tenta criar o bairro DIRETAMENTE
    const newNeighborhood = await databases.createDocument(
      DATABASE_ID,
      NEIGHBORHOODS_ID,
      ID.unique(),
      {
        idNormalized: neighborhoodId,
        name: neighborhoodName,
        cityId: cityId, // <--- CORREÇÃO CHAVE (usando o ID normalizado)
        lat: parseFloat(nominatimData.lat),
        lon: parseFloat(nominatimData.lon)
      }
    );

    return transformDocument(newNeighborhood);

  } catch (error) {
    console.error('Error creating neighborhood:', error);
    return null;
  }
}

// Função auxiliar para tipagem segura
function transformDocument(doc: Models.Document): Neighborhood {
  return {
    id: doc.$id,
    idNormalized: doc.idNormalized,
    name: doc.name,
    cityId: doc.cityId,
    lat: doc.lat,
    lon: doc.lon
  };
}

// getByCity atualizada para usar transformDocument
export async function getByCity(cityId: string): Promise<Neighborhood[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NEIGHBORHOODS_ID,
      [Query.equal('cityId', cityId)]
    );
    return response.documents.map(transformDocument);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return [];
  }
}