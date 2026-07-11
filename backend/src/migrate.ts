import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from './core/database/prisma.client';

async function runMigration() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = join(__dirname, '../prisma/setup_tables.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('Executing SQL migration...');
    await prisma.$executeRawUnsafe(sql);

    console.log('Migration completed successfully!');
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// For Lambda
export const handler = async () => {
  try {
    const result = await runMigration();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// For local execution
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
