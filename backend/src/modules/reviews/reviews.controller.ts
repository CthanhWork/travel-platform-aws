import { Response } from 'express';
import { AuthRequest } from '../../core/middleware/auth.middleware';
import { reviewsService } from './reviews.service';
import {
  createReviewSchema,
  updateReviewSchema,
  voteReviewSchema,
  reportReviewSchema,
  replyReviewSchema,
} from './reviews.validation';
import logger from '../../core/middleware/logger.middleware';

export class ReviewsController {
  /**
   * GET /api/reviews/place/:placeId - Get reviews for a place
   */
  async getReviewsForPlace(req: AuthRequest, res: Response) {
    try {
      const { placeId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await reviewsService.getReviewsForPlace(placeId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch reviews',
      });
    }
  }

  /**
   * POST /api/reviews - Create review
   */
  async createReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const data = createReviewSchema.parse(req.body);
      const review = await reviewsService.createReview(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review created successfully',
      });
    } catch (error: any) {
      logger.error('Create review error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create review',
      });
    }
  }

  /**
   * PUT /api/reviews/:id - Update review
   */
  async updateReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = updateReviewSchema.parse(req.body);
      const review = await reviewsService.updateReview(id, req.user.userId, data);

      res.json({
        success: true,
        data: review,
        message: 'Review updated successfully',
      });
    } catch (error: any) {
      logger.error('Update review error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update review',
      });
    }
  }

  /**
   * DELETE /api/reviews/:id - Delete review
   */
  async deleteReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const result = await reviewsService.deleteReview(id, req.user.userId, req.user.role);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Delete review error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to delete review',
      });
    }
  }

  /**
   * POST /api/reviews/:id/vote - Vote review as helpful
   */
  async voteReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const { helpful } = voteReviewSchema.parse(req.body);
      const result = await reviewsService.voteReview(id, req.user.userId, helpful);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Vote review error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to vote review',
      });
    }
  }

  /**
   * POST /api/reviews/:id/report - Report review
   */
  async reportReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = reportReviewSchema.parse(req.body);
      const report = await reviewsService.reportReview(id, req.user.userId, data);

      res.status(201).json({
        success: true,
        data: report,
        message: 'Review reported successfully',
      });
    } catch (error: any) {
      logger.error('Report review error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to report review',
      });
    }
  }

  /**
   * POST /api/reviews/:id/reply - Reply to review
   */
  async replyToReview(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.params;
      const data = replyReviewSchema.parse(req.body);
      const reply = await reviewsService.replyToReview(id, req.user.userId, req.user.role, data);

      res.status(201).json({
        success: true,
        data: reply,
        message: 'Reply added successfully',
      });
    } catch (error: any) {
      logger.error('Reply to review error:', error);
      const status = error.message.includes('permission') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to reply to review',
      });
    }
  }
}

export const reviewsController = new ReviewsController();
