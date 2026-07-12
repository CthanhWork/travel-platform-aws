import { apiClient } from '@/lib/api-client';
import { Place, toPlace } from './places.service';

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

const toTripPlace = (tripPlace: any): TripPlace => ({
  ...tripPlace,
  notes: tripPlace.note ?? tripPlace.notes,
  place: toPlace(tripPlace.place),
});

const toTrip = (trip: any): Trip => ({
  ...trip,
  places: Array.isArray(trip.places) ? trip.places.map(toTripPlace) : [],
});

export const tripsService = {
  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get('/trips');
    const trips = response.data.data;
    return Array.isArray(trips) ? trips.map(toTrip) : [];
  },

  async getTrip(id: string): Promise<Trip> {
    const response = await apiClient.get(`/trips/${id}`);
    return toTrip(response.data.data);
  },

  async createTrip(data: CreateTripRequest): Promise<Trip> {
    const response = await apiClient.post('/trips', data);
    return toTrip(response.data.data);
  },

  async updateTrip(id: string, data: Partial<CreateTripRequest>): Promise<Trip> {
    const response = await apiClient.put(`/trips/${id}`, data);
    return toTrip(response.data.data);
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  async addPlaceToTrip(tripId: string, placeId: string, day: number, orderInDay: number, notes?: string): Promise<TripPlace> {
    const response = await apiClient.post(`/trips/${tripId}/places`, {
      placeId,
      day,
      orderInDay,
      note: notes,
    });
    return toTripPlace(response.data.data);
  },

  async updateTripPlace(tripId: string, placeId: string, day: number, orderInDay: number, notes?: string): Promise<TripPlace> {
    const response = await apiClient.put(`/trips/${tripId}/places/${placeId}`, {
      day,
      orderInDay,
      note: notes,
    });
    return toTripPlace(response.data.data);
  },

  async removePlaceFromTrip(tripId: string, placeId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}/places/${placeId}`);
  },

  async getSharedTrip(shareToken: string): Promise<Trip> {
    const response = await apiClient.get(`/trips/share/${shareToken}`);
    return toTrip(response.data.data);
  },
};
