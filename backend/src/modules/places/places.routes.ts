import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { placesController } from './places.controller';

const router = Router();

// Public routes
router.get('/', placesController.getAllPlaces.bind(placesController));
router.get('/search', placesController.searchPlaces.bind(placesController));
router.get('/:id', placesController.getPlaceById.bind(placesController));

// Protected routes (require authentication)
router.post('/', authMiddleware, placesController.createPlace.bind(placesController));
router.put('/:id', authMiddleware, placesController.updatePlace.bind(placesController));
router.delete('/:id', authMiddleware, placesController.deletePlace.bind(placesController));
router.post('/:id/upload-url', authMiddleware, placesController.generateUploadUrl.bind(placesController));

export default router;
