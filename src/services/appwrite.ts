import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Substitua pelo seu API Endpoint
  .setProject('YOUR_PROJECT_ID'); // Substitua pelo seu Project ID

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = 'reviews_db';
export const COLLECTION_ID = 'reviews_coll';