import { Response } from 'express';
import { AuthRequest } from '../../core/middleware/auth.middleware';
import { placesService } from './places.service';
import {
  createPlaceSchema,
  updatePlaceSchema,
  searchPlacesSchema,
  uploadUrlSchema,
} from './places.validation';
import logger from '../../core/middleware/logger.middleware';

export class PlacesController {
  /**
   * GET /api/places - Get all places
   */
  async getAllPlaces(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await placesService.getAllPlaces(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Get all places error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch places',
      });
    }
  }

  /**
   * GET /api/places/search - Search places
   */
  async searchPlaces(req: AuthRequest, res: Response) {
    try {
      const filters = searchPlacesSchema.parse(req.query);
      const result = await placesService.searchPlaces(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Search places error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to search places',
      });
    }
  }

  /**
   * GET /api/places/:id - Get place by ID
   */
  async getPlaceById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const place = await placesService.getPlaceById(id, userId);

      res.json({
        success: true,
        data: place,
      });
    } catch (error: any) {
      logger.error('Get place by ID error:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Place not found',
      });
    }
  }

  /**
   * POST /api/places - Create new place
   */
  async createPlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = createPlaceSchema.parse(req.body);
      const place = await placesService.createPlace(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: place,
        message: 'Place created successfully',
      });
    } catch (error: any) {
      logger.error('Create place error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create place',
      });
    }
  }

  /**
   * PUT /api/places/:id - Update place
   */
  async updatePlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = updatePlaceSchema.parse(req.body);
      const place = await placesService.updatePlace(id, req.user.userId, req.user.role, data);

      res.json({
        success: true,
        data: place,
        message: 'Place updated successfully',
      });
    } catch (error: any) {
      logger.error('Update place error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update place',
      });
    }
  }

  /**
   * DELETE /api/places/:id - Delete place
   */
  async deletePlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const result = await placesService.deletePlace(id, req.user.userId, req.user.role);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Delete place error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to delete place',
      });
    }
  }

  /**
   * POST /api/places/:id/upload-url - Generate S3 presigned URL
   */
  async generateUploadUrl(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = uploadUrlSchema.parse(req.body);
      const result = await placesService.generateUploadUrl(id, data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Generate upload URL error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to generate upload URL',
      });
    }
  }
}

export const placesController = new PlacesController();
