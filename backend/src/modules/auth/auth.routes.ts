import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// Register new user
router.post('/register', authController.register.bind(authController));

// Login user
router.post('/login', authController.login.bind(authController));

// Refresh access token
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * Protected routes (authentication required)
 */

// Logout user
router.post('/logout', authMiddleware, authController.logout.bind(authController));

// Get current user profile
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

// Update user profile
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));

// Change password
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

export default router;
