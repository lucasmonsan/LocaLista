import { Query } from 'appwrite';
import { databases, NEIGHBORHOODS_ID, DATABASE_ID, REVIEWS_ID } from './appwrite';
import type { Review, ReviewCreatePayload, ReviewWithNeighborhood } from '../types/appwrite';

export const createReview = async (
  payload: ReviewCreatePayload
): Promise<Review | null> => {
  // Validação do rating (0-10)
  if (payload.rating < 0 || payload.rating > 10) {
    console.error('Rating must be between 0 and 10');
    return null;
  }

  try {
    const review = await databases.createDocument(
      DATABASE_ID,
      REVIEWS_ID,
      'unique()', // ID auto-generado
      payload
    );
    return review as unknown as Review;
  } catch (error) {
    console.error('Failed to create review:', error);
    return null;
  }
};

export const getReviewsByNeighborhood = async (
  neighborhoodId: string
): Promise<ReviewWithNeighborhood[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_ID,
      [
        Query.equal('neighborhoodId', neighborhoodId),
        Query.orderDesc('$createdAt')
      ]
    );

    const reviewsWithNeighborhood = await Promise.all(
      response.documents.map(async (doc: any) => {
        const neighborhood = await databases.getDocument(
          DATABASE_ID,
          NEIGHBORHOODS_ID,
          doc.neighborhoodId
        );

        return {
          id: doc.$id,
          neighborhoodId: doc.neighborhoodId,
          cityId: doc.cityId,
          street: doc.street,
          number: doc.number,
          rating: doc.rating,
          commentary: doc.commentary,
          userId: doc.userId,
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          neighborhoodName: neighborhood.name,
          neighborhoodCoords: {
            lat: neighborhood.lat,
            lon: neighborhood.lon
          }
        } as ReviewWithNeighborhood;
      })
    );

    return reviewsWithNeighborhood;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};