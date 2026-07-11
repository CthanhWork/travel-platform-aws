import serverless from 'serverless-http';
import app from './app';
import { connectRedis } from './core/database/redis.client';
import logger from './core/middleware/logger.middleware';

// Initialize connections on cold start
let isInitialized = false;

const initialize = async () => {
  if (!isInitialized) {
    try {
      await connectRedis();
      logger.info('Lambda cold start: Redis connected');
      isInitialized = true;
    } catch (error) {
      logger.error('Lambda initialization failed:', error);
      throw error;
    }
  }
};

// Wrap Express app with serverless-http
const handler = serverless(app, {
  request: async (request, event, context) => {
    // Initialize on first invocation
    await initialize();
  },
});

export { handler };
