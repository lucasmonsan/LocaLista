import { Client, Account, Databases } from 'appwrite';

export const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const REVIEWS_ID = import.meta.env.VITE_APPWRITE_COLLECTION_REVIEWS_ID;
export const NEIGHBORHOODS_ID = import.meta.env.VITE_APPWRITE_COLLECTION_NEIGHBORHOODS_ID
export const CITIES_ID = import.meta.env.VITE_APPWRITE_COLLECTION_CITIES_ID