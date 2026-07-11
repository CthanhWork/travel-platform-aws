import { Prisma } from '@prisma/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from '../../core/database/prisma.client';
import redisClient from '../../core/database/redis.client';
import { s3Client, S3_BUCKETS } from '../../core/config/aws.config';
import logger from '../../core/middleware/logger.middleware';
import {
  CreatePlaceInput,
  UpdatePlaceInput,
  SearchPlacesInput,
  UploadUrlInput,
} from './places.validation';

export class PlacesService {
  private readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Get all places with pagination
   */
  async getAllPlaces(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Try cache first
      const cacheKey = `places:all:${page}:${limit}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info('Places fetched from cache');
        return JSON.parse(cached);
      }

      const [places, total] = await Promise.all([
        prisma.place.findMany({
          skip,
          take: limit,
          orderBy: [{ avgRating: 'desc' }, { totalReviews: 'desc' }],
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
            isVerified: true,
            createdAt: true,
          },
        }),
        prisma.place.count(),
      ]);

      const result = {
        places,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache result
      await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Get all places error:', error);
      throw error;
    }
  }

  /**
   * Search places with filters
   */
  async searchPlaces(filters: SearchPlacesInput) {
    try {
      const { q, category, city, priceRange, minRating, page = 1, limit = 20, sortBy = 'rating' } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.PlaceWhereInput = {};

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (priceRange) {
        where.priceRange = priceRange;
      }

      if (minRating) {
        where.avgRating = { gte: minRating };
      }

      // Build order by
      let orderBy: Prisma.PlaceOrderByWithRelationInput[] = [];
      switch (sortBy) {
        case 'rating':
          orderBy = [{ avgRating: 'desc' }, { totalReviews: 'desc' }];
          break;
        case 'reviews':
          orderBy = [{ totalReviews: 'desc' }, { avgRating: 'desc' }];
          break;
        case 'recent':
          orderBy = [{ createdAt: 'desc' }];
          break;
      }

      const [places, total] = await Promise.all([
        prisma.place.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
            isVerified: true,
            createdAt: true,
          },
        }),
        prisma.place.count({ where }),
      ]);

      return {
        places,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search places error:', error);
      throw error;
    }
  }

  /**
   * Get place by ID
   */
  async getPlaceById(placeId: string, userId?: string) {
    try {
      // Try cache first
      const cacheKey = `place:${placeId}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`Place ${placeId} fetched from cache`);
        const place = JSON.parse(cached);

        // Track view (async, don't wait)
        this.trackPlaceView(placeId, userId).catch(err =>
          logger.error('Track view error:', err)
        );

        return place;
      }

      const place = await prisma.place.findUnique({
        where: { id: placeId },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              savedBy: true,
            },
          },
        },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Cache result
      await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(place));

      // Track view (async, don't wait)
      this.trackPlaceView(placeId, userId).catch(err =>
        logger.error('Track view error:', err)
      );

      return place;
    } catch (error) {
      logger.error('Get place by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new place
   */
  async createPlace(userId: string, data: CreatePlaceInput) {
    try {
      const place = await prisma.place.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          city: data.city,
          address: data.address,
          priceRange: data.priceRange,
          images: data.images || [],
          openingHours: data.openingHours as any,
          amenities: data.amenities as any,
          latitude: data.latitude ? new Prisma.Decimal(data.latitude.toString()) : null,
          longitude: data.longitude ? new Prisma.Decimal(data.longitude.toString()) : null,
          ownerId: userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Invalidate cache
      await this.invalidatePlacesCache();

      logger.info(`Place created: ${place.id} by user ${userId}`);

      return place;
    } catch (error) {
      logger.error('Create place error:', error);
      throw error;
    }
  }

  /**
   * Update place
   */
  async updatePlace(placeId: string, userId: string, userRole: string, data: UpdatePlaceInput) {
    try {
      // Check ownership or admin
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { ownerId: true },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      if (place.ownerId !== userId && userRole !== 'ADMIN') {
        throw new Error('You do not have permission to update this place');
      }

      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category) updateData.category = data.category;
      if (data.city) updateData.city = data.city;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.priceRange !== undefined) updateData.priceRange = data.priceRange;
      if (data.images) updateData.images = data.images;
      if (data.openingHours !== undefined) updateData.openingHours = data.openingHours;
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.latitude !== undefined) updateData.latitude = new Prisma.Decimal(data.latitude.toString());
      if (data.longitude !== undefined) updateData.longitude = new Prisma.Decimal(data.longitude.toString());

      const updatedPlace = await prisma.place.update({
        where: { id: placeId },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Invalidate cache
      await this.invalidatePlaceCache(placeId);

      logger.info(`Place updated: ${placeId} by user ${userId}`);

      return updatedPlace;
    } catch (error) {
      logger.error('Update place error:', error);
      throw error;
    }
  }

  /**
   * Delete place
   */
  async deletePlace(placeId: string, userId: string, userRole: string) {
    try {
      // Check ownership or admin
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { ownerId: true },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      if (place.ownerId !== userId && userRole !== 'ADMIN') {
        throw new Error('You do not have permission to delete this place');
      }

      await prisma.place.delete({
        where: { id: placeId },
      });

      // Invalidate cache
      await this.invalidatePlaceCache(placeId);

      logger.info(`Place deleted: ${placeId} by user ${userId}`);

      return { message: 'Place deleted successfully' };
    } catch (error) {
      logger.error('Delete place error:', error);
      throw error;
    }
  }

  /**
   * Generate S3 presigned URL for image upload
   */
  async generateUploadUrl(placeId: string, input: UploadUrlInput) {
    try {
      const { fileName, fileType } = input;
      const key = `places/${placeId}/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKETS.PLACES,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

      const publicUrl = `https://${S3_BUCKETS.PLACES}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      logger.info(`Generated upload URL for place ${placeId}`);

      return {
        uploadUrl,
        publicUrl,
        key,
      };
    } catch (error) {
      logger.error('Generate upload URL error:', error);
      throw error;
    }
  }

  /**
   * Track place view (analytics)
   */
  private async trackPlaceView(placeId: string, userId?: string) {
    try {
      await prisma.placeView.create({
        data: {
          placeId,
          userId: userId || null,
        },
      });
    } catch (error) {
      // Don't throw, just log
      logger.error('Track place view error:', error);
    }
  }

  /**
   * Invalidate place cache
   */
  private async invalidatePlaceCache(placeId: string) {
    try {
      await redisClient.del(`place:${placeId}`);
      await this.invalidatePlacesCache();
    } catch (error) {
      logger.error('Invalidate cache error:', error);
    }
  }

  /**
   * Invalidate all places cache
   */
  private async invalidatePlacesCache() {
    try {
      const keys = await redisClient.keys('places:all:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Invalidate places cache error:', error);
    }
  }
}

export const placesService = new PlacesService();
