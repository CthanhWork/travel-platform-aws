/// <reference path="./types/express.d.ts" />

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { config } from './core/config/app.config';
import { loggerMiddleware } from './core/middleware/logger.middleware';
import { errorMiddleware } from './core/middleware/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import placesRoutes from './modules/places/places.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import tripsRoutes from './modules/trips/trips.routes';
import businessRoutes from './modules/business/business.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggerMiddleware);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/business', businessRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorMiddleware);

export default app;
