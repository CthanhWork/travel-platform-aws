import { randomBytes } from 'crypto';
import prisma from '../../core/database/prisma.client';
import redisClient from '../../core/database/redis.client';
import logger from '../../core/middleware/logger.middleware';
import {
  SavePlaceInput,
  CreateTripInput,
  UpdateTripInput,
  AddPlaceToTripInput,
  UpdatePlaceInTripInput,
} from './trips.validation';

export class TripsService {
  private readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Get saved places for user
   */
  async getSavedPlaces(userId: string) {
    try {
      const savedPlaces = await prisma.savedPlace.findMany({
        where: { userId },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              city: true,
              latitude: true,
              longitude: true,
              priceRange: true,
              avgRating: true,
              totalReviews: true,
              images: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return savedPlaces.map((sp) => ({
        ...sp.place,
        savedAt: sp.createdAt,
      }));
    } catch (error) {
      logger.error('Get saved places error:', error);
      throw error;
    }
  }

  /**
   * Save a place
   */
  async savePlace(userId: string, data: SavePlaceInput) {
    try {
      // Check if place exists
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Check if already saved
      const existing = await prisma.savedPlace.findUnique({
        where: {
          userId_placeId: {
            userId,
            placeId: data.placeId,
          },
        },
      });

      if (existing) {
        throw new Error('Place already saved');
      }

      // Save place
      const savedPlace = await prisma.savedPlace.create({
        data: {
          userId,
          placeId: data.placeId,
        },
      });

      logger.info(`Place saved: ${data.placeId} by user ${userId}`);

      return savedPlace;
    } catch (error) {
      logger.error('Save place error:', error);
      throw error;
    }
  }

  /**
   * Unsave a place
   */
  async unsavePlace(userId: string, placeId: string) {
    try {
      await prisma.savedPlace.delete({
        where: {
          userId_placeId: {
            userId,
            placeId,
          },
        },
      });

      logger.info(`Place unsaved: ${placeId} by user ${userId}`);

      return { message: 'Place removed from saved list' };
    } catch (error) {
      logger.error('Unsave place error:', error);
      throw error;
    }
  }

  /**
   * Get all trips for user
   */
  async getAllTrips(userId: string) {
    try {
      const trips = await prisma.trip.findMany({
        where: { userId },
        include: {
          places: {
            include: {
              place: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  city: true,
                  images: true,
                  avgRating: true,
                },
              },
            },
            orderBy: [{ day: 'asc' }, { orderInDay: 'asc' }],
          },
          _count: {
            select: { places: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return trips;
    } catch (error) {
      logger.error('Get all trips error:', error);
      throw error;
    }
  }

  /**
   * Get trip by ID
   */
  async getTripById(tripId: string, userId?: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          places: {
            include: {
              place: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  city: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                  priceRange: true,
                  avgRating: true,
                  totalReviews: true,
                  images: true,
                  openingHours: true,
                },
              },
            },
            orderBy: [{ day: 'asc' }, { orderInDay: 'asc' }],
          },
        },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Check if private trip
      if (!trip.isPublic && trip.userId !== userId) {
        throw new Error('This trip is private');
      }

      return trip;
    } catch (error) {
      logger.error('Get trip by ID error:', error);
      throw error;
    }
  }

  /**
   * Get public trip by share token
   */
  async getTripByShareToken(shareToken: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { shareToken },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          places: {
            include: {
              place: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  city: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                  priceRange: true,
                  avgRating: true,
                  totalReviews: true,
                  images: true,
                },
              },
            },
            orderBy: [{ day: 'asc' }, { orderInDay: 'asc' }],
          },
        },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (!trip.isPublic) {
        throw new Error('This trip is not public');
      }

      return trip;
    } catch (error) {
      logger.error('Get trip by share token error:', error);
      throw error;
    }
  }

  /**
   * Create trip
   */
  async createTrip(userId: string, data: CreateTripInput) {
    try {
      // Generate share token if public
      const shareToken = data.isPublic ? this.generateShareToken() : null;

      const trip = await prisma.trip.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          isPublic: data.isPublic || false,
          shareToken,
        },
        include: {
          _count: {
            select: { places: true },
          },
        },
      });

      logger.info(`Trip created: ${trip.id} by user ${userId}`);

      return trip;
    } catch (error) {
      logger.error('Create trip error:', error);
      throw error;
    }
  }

  /**
   * Update trip
   */
  async updateTrip(tripId: string, userId: string, data: UpdateTripInput) {
    try {
      // Check ownership
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true, shareToken: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.userId !== userId) {
        throw new Error('You do not have permission to update this trip');
      }

      // Generate or remove share token based on isPublic
      let shareToken = trip.shareToken;
      if (data.isPublic !== undefined) {
        if (data.isPublic && !shareToken) {
          shareToken = this.generateShareToken();
        } else if (!data.isPublic) {
          shareToken = null;
        }
      }

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          shareToken,
        },
        include: {
          _count: {
            select: { places: true },
          },
        },
      });

      logger.info(`Trip updated: ${tripId}`);

      return updatedTrip;
    } catch (error) {
      logger.error('Update trip error:', error);
      throw error;
    }
  }

  /**
   * Delete trip
   */
  async deleteTrip(tripId: string, userId: string) {
    try {
      // Check ownership
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.userId !== userId) {
        throw new Error('You do not have permission to delete this trip');
      }

      await prisma.trip.delete({
        where: { id: tripId },
      });

      logger.info(`Trip deleted: ${tripId}`);

      return { message: 'Trip deleted successfully' };
    } catch (error) {
      logger.error('Delete trip error:', error);
      throw error;
    }
  }

  /**
   * Add place to trip
   */
  async addPlaceToTrip(tripId: string, userId: string, data: AddPlaceToTripInput) {
    try {
      // Check trip ownership
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.userId !== userId) {
        throw new Error('You do not have permission to modify this trip');
      }

      // Check place exists
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Check if place already in trip
      const existing = await prisma.tripPlace.findUnique({
        where: {
          tripId_placeId: {
            tripId,
            placeId: data.placeId,
          },
        },
      });

      if (existing) {
        throw new Error('Place already in trip');
      }

      // Add place to trip
      const tripPlace = await prisma.tripPlace.create({
        data: {
          tripId,
          placeId: data.placeId,
          day: data.day,
          orderInDay: data.orderInDay,
          note: data.note,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
              images: true,
              avgRating: true,
            },
          },
        },
      });

      logger.info(`Place ${data.placeId} added to trip ${tripId}`);

      return tripPlace;
    } catch (error) {
      logger.error('Add place to trip error:', error);
      throw error;
    }
  }

  /**
   * Update place in trip
   */
  async updatePlaceInTrip(tripId: string, placeId: string, userId: string, data: UpdatePlaceInTripInput) {
    try {
      // Check trip ownership
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.userId !== userId) {
        throw new Error('You do not have permission to modify this trip');
      }

      const updatedTripPlace = await prisma.tripPlace.update({
        where: {
          tripId_placeId: {
            tripId,
            placeId,
          },
        },
        data: {
          day: data.day,
          orderInDay: data.orderInDay,
          note: data.note,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
              images: true,
            },
          },
        },
      });

      logger.info(`Place ${placeId} updated in trip ${tripId}`);

      return updatedTripPlace;
    } catch (error) {
      logger.error('Update place in trip error:', error);
      throw error;
    }
  }

  /**
   * Remove place from trip
   */
  async removePlaceFromTrip(tripId: string, placeId: string, userId: string) {
    try {
      // Check trip ownership
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.userId !== userId) {
        throw new Error('You do not have permission to modify this trip');
      }

      await prisma.tripPlace.delete({
        where: {
          tripId_placeId: {
            tripId,
            placeId,
          },
        },
      });

      logger.info(`Place ${placeId} removed from trip ${tripId}`);

      return { message: 'Place removed from trip' };
    } catch (error) {
      logger.error('Remove place from trip error:', error);
      throw error;
    }
  }

  /**
   * Generate unique share token
   */
  private generateShareToken(): string {
    return randomBytes(16).toString('hex');
  }
}

export const tripsService = new TripsService();
