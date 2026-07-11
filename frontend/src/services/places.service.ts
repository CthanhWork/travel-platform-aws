import { apiClient } from '@/lib/api-client';

export type PlaceCategory = 'HOTEL' | 'RESTAURANT' | 'ATTRACTION' | 'TOUR';

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  priceLevel?: number;
  rating?: number;
  reviewCount: number;
  imageUrls: string[];
  website?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  ownerId?: string;
  createdAt: string;
  isSaved?: boolean;
}

export interface PlaceFilters {
  category?: PlaceCategory;
  city?: string;
  country?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlacesResponse {
  places: Place[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// The API returns database field names and nests pagination under `data`.
// Convert that response once so pages can rely on a stable frontend shape.
const toPlace = (place: any): Place => ({
  id: place.id,
  name: place.name || '',
  description: place.description || '',
  category: place.category,
  address: place.address || '',
  city: place.city || '',
  country: place.country || '',
  latitude: place.latitude === null ? undefined : Number(place.latitude),
  longitude: place.longitude === null ? undefined : Number(place.longitude),
  priceLevel: typeof place.priceRange === 'string' ? place.priceRange.length : place.priceLevel,
  rating: place.avgRating === undefined ? place.rating : Number(place.avgRating),
  reviewCount: Number(place.totalReviews ?? place.reviewCount ?? 0),
  imageUrls: Array.isArray(place.images) ? place.images : place.imageUrls || [],
  website: place.website,
  phone: place.phone,
  email: place.email,
  openingHours: place.openingHours,
  ownerId: place.ownerId,
  createdAt: place.createdAt,
  isSaved: place.isSaved,
});

const toPlacesResponse = (response: any): PlacesResponse => {
  const data = response.data?.data || {};
  const pagination = data.pagination || {};

  return {
    places: Array.isArray(data.places) ? data.places.map(toPlace) : [],
    total: Number(pagination.total ?? data.total ?? 0),
    page: Number(pagination.page ?? data.page ?? 1),
    limit: Number(pagination.limit ?? data.limit ?? 20),
    totalPages: Number(pagination.totalPages ?? data.totalPages ?? 0),
  };
};

export const placesService = {
  async getPlaces(filters: PlaceFilters = {}): Promise<PlacesResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const needsSearchEndpoint = Boolean(
      filters.search || filters.category || filters.city || filters.minRating || filters.maxPrice
    );
    if (filters.search) {
      params.delete('search');
      params.set('q', filters.search);
    }

    const endpoint = needsSearchEndpoint ? '/places/search' : '/places';
    const response = await apiClient.get(`${endpoint}?${params.toString()}`);
    return toPlacesResponse(response);
  },

  async getPlace(id: string): Promise<Place> {
    const response = await apiClient.get(`/places/${id}`);
    return toPlace(response.data.data);
  },

  async searchPlaces(query: string, filters: PlaceFilters = {}): Promise<PlacesResponse> {
    const response = await apiClient.get('/places/search', {
      params: { q: query, ...filters },
    });
    return toPlacesResponse(response);
  },

  async savePlace(placeId: string): Promise<{ message: string }> {
    const response = await apiClient.post('/trips/saved-places', { placeId });
    return response.data.data;
  },

  async unsavePlace(placeId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/trips/saved-places/${placeId}`);
    return response.data.data;
  },

  async getSavedPlaces(): Promise<Place[]> {
    const response = await apiClient.get('/trips/saved-places');
    const places = response.data.data;
    return Array.isArray(places) ? places.map(toPlace) : [];
  },
};
