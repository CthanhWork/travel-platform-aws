import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { tripsController } from './trips.controller';

const router = Router();

// Saved Places routes (all require authentication)
router.get('/saved-places', authMiddleware, tripsController.getSavedPlaces.bind(tripsController));
router.post('/saved-places', authMiddleware, tripsController.savePlace.bind(tripsController));
router.delete('/saved-places/:placeId', authMiddleware, tripsController.unsavePlace.bind(tripsController));

// Public share route (no auth required)
router.get('/share/:shareToken', tripsController.getTripByShareToken.bind(tripsController));

// Trip routes (all require authentication)
router.get('/', authMiddleware, tripsController.getAllTrips.bind(tripsController));
router.get('/:id', tripsController.getTripById.bind(tripsController)); // Auth optional
router.post('/', authMiddleware, tripsController.createTrip.bind(tripsController));
router.put('/:id', authMiddleware, tripsController.updateTrip.bind(tripsController));
router.delete('/:id', authMiddleware, tripsController.deleteTrip.bind(tripsController));

// Trip places routes (all require authentication)
router.post('/:id/places', authMiddleware, tripsController.addPlaceToTrip.bind(tripsController));
router.put('/:id/places/:placeId', authMiddleware, tripsController.updatePlaceInTrip.bind(tripsController));
router.delete('/:id/places/:placeId', authMiddleware, tripsController.removePlaceFromTrip.bind(tripsController));

export default router;
