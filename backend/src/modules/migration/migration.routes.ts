import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from '../../core/database/prisma.client';
import logger from '../../core/middleware/logger.middleware';

const router = Router();

// Migration endpoint (should be protected in production!)
router.post('/run-migration', async (req: Request, res: Response) => {
  try {
    logger.info('Starting database migration...');

    const sqlPath = join(__dirname, '../../../prisma/setup_tables.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    logger.info(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await prisma.$executeRawUnsafe(statement);
          logger.info(`Executed statement ${i + 1}/${statements.length}`);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            logger.warn(`Statement ${i + 1} skipped: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }

    logger.info('Migration completed successfully!');

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      statementsExecuted: statements.length,
    });
  } catch (error: any) {
    logger.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Migration failed',
    });
  }
});

export default router;
