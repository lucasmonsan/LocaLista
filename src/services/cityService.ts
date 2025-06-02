import { databases } from './appwrite';
import { DATABASE_ID, CITIES_ID } from './appwrite';
import { ID, Query } from 'appwrite';

const normalizeId = (...parts: string[]): string => {
  return parts
    .filter(Boolean)
    .map(part => part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    .join('_');
};

export const getOrCreateCity = async (
  name: string,
  state: string,
  country: string
): Promise<string> => { // Retorna apenas o ID
  const cityId = normalizeId(name, state, country);

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CITIES_ID,
      [Query.equal('idNormalized', cityId)]
    );

    if (response.documents.length > 0) {
      return response.documents[0].$id;
    }

    const newCity = await databases.createDocument(
      DATABASE_ID,
      CITIES_ID,
      ID.unique(),
      {
        idNormalized: cityId,
        name,
        state,
        country
      }
    );
    return newCity.$id;

  } catch (error) {
    console.error('Error creating city:', error);
    throw error; // Propaga o erro para tratamento superior
  }
};