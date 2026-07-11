import { Request } from 'express';

/**
 * Extend Express Request with user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
