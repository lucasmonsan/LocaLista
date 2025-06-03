export interface Coordinates {
  lat: number;
  lon: number;
  zoom?: number;
}

export interface MapPin {
  id: string;
  position: Coordinates;
  reviewCount: number;
  averageRating: number;
}