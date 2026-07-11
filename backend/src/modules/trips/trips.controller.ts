import { Response } from 'express';
import { AuthRequest } from '../../core/middleware/auth.middleware';
import { tripsService } from './trips.service';
import {
  savePlaceSchema,
  createTripSchema,
  updateTripSchema,
  addPlaceToTripSchema,
  updatePlaceInTripSchema,
} from './trips.validation';
import logger from '../../core/middleware/logger.middleware';

export class TripsController {
  /**
   * GET /api/trips/saved-places - Get saved places
   */
  async getSavedPlaces(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const places = await tripsService.getSavedPlaces(req.user.userId);

      res.json({
        success: true,
        data: places,
      });
    } catch (error: any) {
      logger.error('Get saved places error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch saved places',
      });
    }
  }

  /**
   * POST /api/trips/saved-places - Save a place
   */
  async savePlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = savePlaceSchema.parse(req.body);
      const result = await tripsService.savePlace(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Place saved successfully',
      });
    } catch (error: any) {
      logger.error('Save place error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to save place',
      });
    }
  }

  /**
   * DELETE /api/trips/saved-places/:placeId - Unsave a place
   */
  async unsavePlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { placeId } = req.params;
      const result = await tripsService.unsavePlace(req.user.userId, placeId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Unsave place error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to unsave place',
      });
    }
  }

  /**
   * GET /api/trips - Get all trips
   */
  async getAllTrips(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const trips = await tripsService.getAllTrips(req.user.userId);

      res.json({
        success: true,
        data: trips,
      });
    } catch (error: any) {
      logger.error('Get all trips error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch trips',
      });
    }
  }

  /**
   * GET /api/trips/:id - Get trip by ID
   */
  async getTripById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await tripsService.getTripById(id, userId);

      res.json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      logger.error('Get trip by ID error:', error);
      const status = error.message.includes('private') ? 403 : 404;
      res.status(status).json({
        success: false,
        error: error.message || 'Trip not found',
      });
    }
  }

  /**
   * GET /api/trips/share/:shareToken - Get public trip by share token
   */
  async getTripByShareToken(req: AuthRequest, res: Response) {
    try {
      const { shareToken } = req.params;
      const trip = await tripsService.getTripByShareToken(shareToken);

      res.json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      logger.error('Get trip by share token error:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Trip not found',
      });
    }
  }

  /**
   * POST /api/trips - Create trip
   */
  async createTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = createTripSchema.parse(req.body);
      const trip = await tripsService.createTrip(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: trip,
        message: 'Trip created successfully',
      });
    } catch (error: any) {
      logger.error('Create trip error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create trip',
      });
    }
  }

  /**
   * PUT /api/trips/:id - Update trip
   */
  async updateTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = updateTripSchema.parse(req.body);
      const trip = await tripsService.updateTrip(id, req.user.userId, data);

      res.json({
        success: true,
        data: trip,
        message: 'Trip updated successfully',
      });
    } catch (error: any) {
      logger.error('Update trip error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update trip',
      });
    }
  }

  /**
   * DELETE /api/trips/:id - Delete trip
   */
  async deleteTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const result = await tripsService.deleteTrip(id, req.user.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Delete trip error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to delete trip',
      });
    }
  }

  /**
   * POST /api/trips/:id/places - Add place to trip
   */
  async addPlaceToTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = addPlaceToTripSchema.parse(req.body);
      const result = await tripsService.addPlaceToTrip(id, req.user.userId, data);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Place added to trip',
      });
    } catch (error: any) {
      logger.error('Add place to trip error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to add place to trip',
      });
    }
  }

  /**
   * PUT /api/trips/:id/places/:placeId - Update place in trip
   */
  async updatePlaceInTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id, placeId } = req.params;
      const data = updatePlaceInTripSchema.parse(req.body);
      const result = await tripsService.updatePlaceInTrip(id, placeId, req.user.userId, data);

      res.json({
        success: true,
        data: result,
        message: 'Place updated in trip',
      });
    } catch (error: any) {
      logger.error('Update place in trip error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update place in trip',
      });
    }
  }

  /**
   * DELETE /api/trips/:id/places/:placeId - Remove place from trip
   */
  async removePlaceFromTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id, placeId } = req.params;
      const result = await tripsService.removePlaceFromTrip(id, placeId, req.user.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Remove place from trip error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to remove place from trip',
      });
    }
  }
}

export const tripsController = new TripsController();
