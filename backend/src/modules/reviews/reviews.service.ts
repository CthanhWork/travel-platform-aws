import { Prisma } from '@prisma/client';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import prisma from '../../core/database/prisma.client';
import redisClient from '../../core/database/redis.client';
import { sqsClient, SQS_QUEUES } from '../../core/config/aws.config';
import logger from '../../core/middleware/logger.middleware';
import {
  CreateReviewInput,
  UpdateReviewInput,
  ReportReviewInput,
  ReplyReviewInput,
} from './reviews.validation';

export class ReviewsService {
  /**
   * Get reviews for a place
   */
  async getReviewsForPlace(placeId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: {
            placeId,
            isDeleted: false,
          },
          skip,
          take: limit,
          orderBy: [{ createdAt: 'desc' }],
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        }),
        prisma.review.count({
          where: {
            placeId,
            isDeleted: false,
          },
        }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get reviews error:', error);
      throw error;
    }
  }

  /**
   * Create review
   */
  async createReview(userId: string, data: CreateReviewInput) {
    try {
      // Check if place exists
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Check if user already reviewed this place
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          placeId: data.placeId,
          isDeleted: false,
        },
      });

      if (existingReview) {
        throw new Error('You have already reviewed this place');
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId,
          placeId: data.placeId,
          rating: data.rating,
          content: data.content,
          images: data.images || [],
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Send message to SQS for rating calculation (async)
      this.queueRatingCalculation(data.placeId).catch((err) =>
        logger.error('Failed to queue rating calculation:', err)
      );

      logger.info(`Review created: ${review.id} for place ${data.placeId}`);

      return review;
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId: string, userId: string, data: UpdateReviewInput) {
    try {
      // Check ownership
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { userId: true, placeId: true },
      });

      if (!review) {
        throw new Error('Review not found');
      }

      if (review.userId !== userId) {
        throw new Error('You do not have permission to update this review');
      }

      // Update review
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          rating: data.rating,
          content: data.content,
          images: data.images,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Recalculate rating if rating changed
      if (data.rating !== undefined) {
        this.queueRatingCalculation(review.placeId).catch((err) =>
          logger.error('Failed to queue rating calculation:', err)
        );
      }

      logger.info(`Review updated: ${reviewId}`);

      return updatedReview;
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Delete review (soft delete)
   */
  async deleteReview(reviewId: string, userId: string, userRole: string) {
    try {
      // Check ownership or admin
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { userId: true, placeId: true },
      });

      if (!review) {
        throw new Error('Review not found');
      }

      if (review.userId !== userId && userRole !== 'ADMIN') {
        throw new Error('You do not have permission to delete this review');
      }

      // Soft delete
      await prisma.review.update({
        where: { id: reviewId },
        data: { isDeleted: true },
      });

      // Recalculate rating
      this.queueRatingCalculation(review.placeId).catch((err) =>
        logger.error('Failed to queue rating calculation:', err)
      );

      logger.info(`Review deleted: ${reviewId}`);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  }

  /**
   * Vote review as helpful
   */
  async voteReview(reviewId: string, userId: string, helpful: boolean) {
    try {
      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new Error('Review not found');
      }

      // Check if user already voted (using Redis)
      const voteKey = `review_vote:${reviewId}:${userId}`;
      const hasVoted = await redisClient.get(voteKey);

      if (hasVoted) {
        throw new Error('You have already voted on this review');
      }

      // Increment helpful count
      if (helpful) {
        await prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
        });
      }

      // Store vote in Redis (24 hours)
      await redisClient.setEx(voteKey, 24 * 60 * 60, 'true');

      logger.info(`Review voted: ${reviewId} by user ${userId}`);

      return { message: 'Vote recorded successfully' };
    } catch (error) {
      logger.error('Vote review error:', error);
      throw error;
    }
  }

  /**
   * Report review
   */
  async reportReview(reviewId: string, userId: string, data: ReportReviewInput) {
    try {
      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new Error('Review not found');
      }

      // Check if user already reported this review
      const existingReport = await prisma.reviewReport.findFirst({
        where: {
          reviewId,
          reporterId: userId,
        },
      });

      if (existingReport) {
        throw new Error('You have already reported this review');
      }

      // Create report
      const report = await prisma.reviewReport.create({
        data: {
          reviewId,
          reporterId: userId,
          reason: data.reason,
        },
      });

      logger.info(`Review reported: ${reviewId} by user ${userId}`);

      return report;
    } catch (error) {
      logger.error('Report review error:', error);
      throw error;
    }
  }

  /**
   * Reply to review (business owner)
   */
  async replyToReview(reviewId: string, userId: string, userRole: string, data: ReplyReviewInput) {
    try {
      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          place: {
            select: { ownerId: true },
          },
        },
      });

      if (!review) {
        throw new Error('Review not found');
      }

      // Check if user is owner or admin
      if (review.place.ownerId !== userId && userRole !== 'ADMIN') {
        throw new Error('Only place owner or admin can reply to reviews');
      }

      // Create reply
      const reply = await prisma.reviewReply.create({
        data: {
          reviewId,
          userId,
          content: data.content,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      logger.info(`Review reply created: ${reply.id} for review ${reviewId}`);

      return reply;
    } catch (error) {
      logger.error('Reply to review error:', error);
      throw error;
    }
  }

  /**
   * Queue rating calculation (async via SQS)
   */
  private async queueRatingCalculation(placeId: string) {
    try {
      // If SQS queue URL not configured, calculate synchronously
      if (!SQS_QUEUES.RATING_CALCULATION) {
        logger.warn('SQS queue not configured, calculating rating synchronously');
        await this.calculatePlaceRating(placeId);
        return;
      }

      const command = new SendMessageCommand({
        QueueUrl: SQS_QUEUES.RATING_CALCULATION,
        MessageBody: JSON.stringify({ placeId }),
      });

      await sqsClient.send(command);
      logger.info(`Rating calculation queued for place ${placeId}`);
    } catch (error) {
      logger.error('Queue rating calculation error:', error);
      // Fallback to synchronous calculation
      await this.calculatePlaceRating(placeId);
    }
  }

  /**
   * Calculate place rating (called by worker or synchronously)
   */
  async calculatePlaceRating(placeId: string) {
    try {
      const stats = await prisma.review.aggregate({
        where: {
          placeId,
          isDeleted: false,
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      const avgRating = stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(1)) : 0;
      const totalReviews = stats._count.id;

      await prisma.place.update({
        where: { id: placeId },
        data: {
          avgRating: new Prisma.Decimal(avgRating.toString()),
          totalReviews,
        },
      });

      // Invalidate place cache
      await redisClient.del(`place:${placeId}`);

      logger.info(`Rating calculated for place ${placeId}: ${avgRating} (${totalReviews} reviews)`);
    } catch (error) {
      logger.error('Calculate rating error:', error);
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();
