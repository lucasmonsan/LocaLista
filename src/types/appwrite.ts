import type { Coordinates } from "./index";

export type { Query } from 'appwrite';

export interface Neighborhood {
  id: string;
  idNormalized: string;
  name: string;
  cityId: string;
  lat: number;
  lon: number;
}

export interface City {
  id: string;
  idNormalized: string;
  name: string;
  state: string;
  country: string;
}

export interface Review {
  id: string;
  neighborhoodId: string;
  cityId: string;
  street: string;
  number: number;
  rating: number;
  commentary: string;
  userId: string;
}

export interface ReviewCreatePayload {
  neighborhoodId: string;
  cityId: string;
  street: string;
  number: number;
  rating: number;
  commentary: string;
  userId: string;
}

export interface ReviewWithNeighborhood extends Review {
  neighborhoodName: string;
  neighborhoodCoords: Coordinates;
  $id: string;
  $collectionId?: string;
  $databaseId?: string;
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: any;
}