import { Response } from 'express';
import { AuthRequest } from '../../core/middleware/auth.middleware';
import { businessService } from './business.service';
import {
  claimPlaceSchema,
  reviewClaimSchema,
  createBookingSchema,
  updateBookingStatusSchema,
} from './business.validation';
import logger from '../../core/middleware/logger.middleware';

export class BusinessController {
  /**
   * POST /api/business/claims - Claim a place
   */
  async claimPlace(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = claimPlaceSchema.parse(req.body);
      const claim = await businessService.claimPlace(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: claim,
        message: 'Claim submitted successfully',
      });
    } catch (error: any) {
      logger.error('Claim place error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to submit claim',
      });
    }
  }

  /**
   * GET /api/business/claims/my - Get user's claims
   */
  async getMyClaims(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const claims = await businessService.getMyClaims(req.user.userId);

      res.json({
        success: true,
        data: claims,
      });
    } catch (error: any) {
      logger.error('Get my claims error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch claims',
      });
    }
  }

  /**
   * GET /api/business/claims/pending - Get pending claims (admin)
   */
  async getPendingClaims(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
      }

      const claims = await businessService.getPendingClaims();

      res.json({
        success: true,
        data: claims,
      });
    } catch (error: any) {
      logger.error('Get pending claims error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch claims',
      });
    }
  }

  /**
   * PUT /api/business/claims/:id - Review claim (admin)
   */
  async reviewClaim(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
      }

      const { id } = req.params;
      const data = reviewClaimSchema.parse(req.body);
      const claim = await businessService.reviewClaim(id, data);

      res.json({
        success: true,
        data: claim,
        message: `Claim ${data.status.toLowerCase()} successfully`,
      });
    } catch (error: any) {
      logger.error('Review claim error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to review claim',
      });
    }
  }

  /**
   * POST /api/business/bookings - Create booking
   */
  async createBooking(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = createBookingSchema.parse(req.body);
      const booking = await businessService.createBooking(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
      });
    } catch (error: any) {
      logger.error('Create booking error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create booking',
      });
    }
  }

  /**
   * GET /api/business/bookings/my - Get user's bookings
   */
  async getMyBookings(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const bookings = await businessService.getMyBookings(req.user.userId);

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      logger.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch bookings',
      });
    }
  }

  /**
   * GET /api/business/bookings/:id - Get booking by ID
   */
  async getBookingById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const booking = await businessService.getBookingById(id, req.user.userId, req.user.role);

      res.json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      logger.error('Get booking by ID error:', error);
      const status = error.message.includes('permission') ? 403 : 404;
      res.status(status).json({
        success: false,
        error: error.message || 'Booking not found',
      });
    }
  }

  /**
   * PUT /api/business/bookings/:id/status - Update booking status
   */
  async updateBookingStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = updateBookingStatusSchema.parse(req.body);
      const booking = await businessService.updateBookingStatus(
        id,
        req.user.userId,
        req.user.role,
        data
      );

      res.json({
        success: true,
        data: booking,
        message: 'Booking status updated',
      });
    } catch (error: any) {
      logger.error('Update booking status error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update booking status',
      });
    }
  }

  /**
   * DELETE /api/business/bookings/:id - Cancel booking
   */
  async cancelBooking(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const result = await businessService.cancelBooking(id, req.user.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Cancel booking error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to cancel booking',
      });
    }
  }

  /**
   * GET /api/business/places/:placeId/bookings - Get bookings for place
   */
  async getPlaceBookings(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { placeId } = req.params;
      const bookings = await businessService.getPlaceBookings(
        placeId,
        req.user.userId,
        req.user.role
      );

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      logger.error('Get place bookings error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to fetch bookings',
      });
    }
  }

  /**
   * GET /api/business/admin/dashboard - Get dashboard stats (admin)
   */
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
      }

      const stats = await businessService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard stats',
      });
    }
  }
}

export const businessController = new BusinessController();
