import { apiClient } from '@/lib/api-client';
import { Place } from './places.service';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  shareToken?: string;
  userId: string;
  createdAt: string;
  places?: TripPlace[];
}

export interface TripPlace {
  id: string;
  tripId: string;
  placeId: string;
  day: number;
  orderInDay: number;
  notes?: string;
  place: Place;
}

export interface CreateTripRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
}

export const tripsService = {
  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get('/trips');
    return response.data;
  },

  async getTrip(id: string): Promise<Trip> {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  async createTrip(data: CreateTripRequest): Promise<Trip> {
    const response = await apiClient.post('/trips', data);
    return response.data;
  },

  async updateTrip(id: string, data: Partial<CreateTripRequest>): Promise<Trip> {
    const response = await apiClient.put(`/trips/${id}`, data);
    return response.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  async addPlaceToTrip(tripId: string, placeId: string, day: number, orderInDay: number, notes?: string): Promise<TripPlace> {
    const response = await apiClient.post(`/trips/${tripId}/places`, {
      placeId,
      day,
      orderInDay,
      notes,
    });
    return response.data;
  },

  async updateTripPlace(tripId: string, placeId: string, day: number, orderInDay: number, notes?: string): Promise<TripPlace> {
    const response = await apiClient.put(`/trips/${tripId}/places/${placeId}`, {
      day,
      orderInDay,
      notes,
    });
    return response.data;
  },

  async removePlaceFromTrip(tripId: string, placeId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}/places/${placeId}`);
  },

  async getSharedTrip(shareToken: string): Promise<Trip> {
    const response = await apiClient.get(`/trips/share/${shareToken}`);
    return response.data;
  },
};
