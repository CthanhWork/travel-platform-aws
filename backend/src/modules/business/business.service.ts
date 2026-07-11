import prisma from '../../core/database/prisma.client';
import logger from '../../core/middleware/logger.middleware';
import {
  ClaimPlaceInput,
  ReviewClaimInput,
  CreateBookingInput,
  UpdateBookingStatusInput,
} from './business.validation';

export class BusinessService {
  /**
   * Claim a place
   */
  async claimPlace(userId: string, data: ClaimPlaceInput) {
    try {
      // Check if place exists
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Check if user already claimed this place
      const existingClaim = await prisma.businessClaim.findFirst({
        where: {
          userId,
          placeId: data.placeId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (existingClaim) {
        throw new Error('You have already claimed this place');
      }

      // Create claim
      const claim = await prisma.businessClaim.create({
        data: {
          userId,
          placeId: data.placeId,
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          verificationDocUrl: data.verificationDocUrl,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
            },
          },
        },
      });

      logger.info(`Place claim created: ${claim.id} for place ${data.placeId}`);

      return claim;
    } catch (error) {
      logger.error('Claim place error:', error);
      throw error;
    }
  }

  /**
   * Get user's claims
   */
  async getMyClaims(userId: string) {
    try {
      const claims = await prisma.businessClaim.findMany({
        where: { userId },
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
        orderBy: { createdAt: 'desc' },
      });

      return claims;
    } catch (error) {
      logger.error('Get my claims error:', error);
      throw error;
    }
  }

  /**
   * Get all pending claims (admin)
   */
  async getPendingClaims() {
    try {
      const claims = await prisma.businessClaim.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
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
        orderBy: { createdAt: 'asc' },
      });

      return claims;
    } catch (error) {
      logger.error('Get pending claims error:', error);
      throw error;
    }
  }

  /**
   * Review claim (admin)
   */
  async reviewClaim(claimId: string, data: ReviewClaimInput) {
    try {
      const claim = await prisma.businessClaim.findUnique({
        where: { id: claimId },
        include: { place: true },
      });

      if (!claim) {
        throw new Error('Claim not found');
      }

      if (claim.status !== 'PENDING') {
        throw new Error('This claim has already been reviewed');
      }

      // Update claim
      const updatedClaim = await prisma.businessClaim.update({
        where: { id: claimId },
        data: {
          status: data.status,
          adminNote: data.adminNote,
          reviewedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          place: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // If approved, set user as place owner
      if (data.status === 'APPROVED') {
        await prisma.place.update({
          where: { id: claim.placeId },
          data: { ownerId: claim.userId },
        });
      }

      logger.info(`Claim ${claimId} reviewed: ${data.status}`);

      return updatedClaim;
    } catch (error) {
      logger.error('Review claim error:', error);
      throw error;
    }
  }

  /**
   * Create booking
   */
  async createBooking(userId: string, data: CreateBookingInput) {
    try {
      // Check if place exists
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      // Parse date
      const bookingDate = new Date(data.bookingDate);

      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        throw new Error('Booking date must be in the future');
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          placeId: data.placeId,
          bookingDate,
          numGuests: data.numGuests,
          specialRequests: data.specialRequests,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
              address: true,
              images: true,
            },
          },
        },
      });

      logger.info(`Booking created: ${booking.id} for place ${data.placeId}`);

      return booking;
    } catch (error) {
      logger.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(userId: string) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
              address: true,
              images: true,
              ownerId: true,
            },
          },
        },
        orderBy: { bookingDate: 'desc' },
      });

      return bookings;
    } catch (error) {
      logger.error('Get my bookings error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, userId: string, userRole: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              city: true,
              address: true,
              images: true,
              ownerId: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check permission
      const isOwner = booking.userId === userId;
      const isPlaceOwner = booking.place.ownerId === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isOwner && !isPlaceOwner && !isAdmin) {
        throw new Error('You do not have permission to view this booking');
      }

      return booking;
    } catch (error) {
      logger.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    userRole: string,
    data: UpdateBookingStatusInput
  ) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          place: {
            select: { ownerId: true },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check permission
      const isCustomer = booking.userId === userId;
      const isPlaceOwner = booking.place.ownerId === userId;
      const isAdmin = userRole === 'ADMIN';

      // Only place owner or admin can confirm/complete
      if (['CONFIRMED', 'COMPLETED'].includes(data.status) && !isPlaceOwner && !isAdmin) {
        throw new Error('Only place owner or admin can confirm/complete bookings');
      }

      // Customer can cancel their own booking
      if (data.status === 'CANCELLED' && !isCustomer && !isPlaceOwner && !isAdmin) {
        throw new Error('You do not have permission to cancel this booking');
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: data.status },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      });

      logger.info(`Booking ${bookingId} status updated to ${data.status}`);

      return updatedBooking;
    } catch (error) {
      logger.error('Update booking status error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, userId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('You can only cancel your own bookings');
      }

      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed booking');
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      logger.info(`Booking cancelled: ${bookingId}`);

      return { message: 'Booking cancelled successfully' };
    } catch (error) {
      logger.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get bookings for place (owner)
   */
  async getPlaceBookings(placeId: string, userId: string, userRole: string) {
    try {
      // Check permission
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { ownerId: true },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      if (place.ownerId !== userId && userRole !== 'ADMIN') {
        throw new Error('You do not have permission to view bookings for this place');
      }

      const bookings = await prisma.booking.findMany({
        where: { placeId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { bookingDate: 'desc' },
      });

      return bookings;
    } catch (error) {
      logger.error('Get place bookings error:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats() {
    try {
      const [totalUsers, totalPlaces, totalReviews, pendingClaims, totalBookings] =
        await Promise.all([
          prisma.user.count(),
          prisma.place.count(),
          prisma.review.count({ where: { isDeleted: false } }),
          prisma.businessClaim.count({ where: { status: 'PENDING' } }),
          prisma.booking.count(),
        ]);

      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      const recentPlaces = await prisma.place.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
          isVerified: true,
          createdAt: true,
        },
      });

      return {
        stats: {
          totalUsers,
          totalPlaces,
          totalReviews,
          pendingClaims,
          totalBookings,
        },
        recentUsers,
        recentPlaces,
      };
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      throw error;
    }
  }
}

export const businessService = new BusinessService();
