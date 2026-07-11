import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { businessController } from './business.controller';

const router = Router();

// Business Claims routes
router.post('/claims', authMiddleware, businessController.claimPlace.bind(businessController));
router.get('/claims/my', authMiddleware, businessController.getMyClaims.bind(businessController));
router.get(
  '/claims/pending',
  authMiddleware,
  businessController.getPendingClaims.bind(businessController)
);
router.put('/claims/:id', authMiddleware, businessController.reviewClaim.bind(businessController));

// Bookings routes
router.post('/bookings', authMiddleware, businessController.createBooking.bind(businessController));
router.get(
  '/bookings/my',
  authMiddleware,
  businessController.getMyBookings.bind(businessController)
);
router.get(
  '/bookings/:id',
  authMiddleware,
  businessController.getBookingById.bind(businessController)
);
router.put(
  '/bookings/:id/status',
  authMiddleware,
  businessController.updateBookingStatus.bind(businessController)
);
router.delete(
  '/bookings/:id',
  authMiddleware,
  businessController.cancelBooking.bind(businessController)
);

// Place bookings (owner view)
router.get(
  '/places/:placeId/bookings',
  authMiddleware,
  businessController.getPlaceBookings.bind(businessController)
);

// Admin routes
router.get(
  '/admin/dashboard',
  authMiddleware,
  businessController.getDashboardStats.bind(businessController)
);

export default router;
