import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { reviewsController } from './reviews.controller';

const router = Router();

// Public routes
router.get('/place/:placeId', reviewsController.getReviewsForPlace.bind(reviewsController));

// Protected routes (require authentication)
router.post('/', authMiddleware, reviewsController.createReview.bind(reviewsController));
router.put('/:id', authMiddleware, reviewsController.updateReview.bind(reviewsController));
router.delete('/:id', authMiddleware, reviewsController.deleteReview.bind(reviewsController));
router.post('/:id/vote', authMiddleware, reviewsController.voteReview.bind(reviewsController));
router.post('/:id/report', authMiddleware, reviewsController.reportReview.bind(reviewsController));
router.post('/:id/reply', authMiddleware, reviewsController.replyToReview.bind(reviewsController));

export default router;
