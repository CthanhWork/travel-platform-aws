const { PrismaClient } = require('@prisma/client');

const databaseNameFromUrl = (databaseUrl) => {
  const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');

  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error('DATABASE_URL must use an alphanumeric database name');
  }

  return databaseName;
};

exports.handler = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const databaseName = databaseNameFromUrl(databaseUrl);
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';

  const prisma = new PrismaClient({
    datasources: { db: { url: adminUrl.toString() } },
  });

  try {
    const existing = await prisma.$queryRawUnsafe(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      databaseName
    );

    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
      return { statusCode: 201, body: JSON.stringify({ created: true, database: databaseName }) };
    }

    return { statusCode: 200, body: JSON.stringify({ created: false, database: databaseName }) };
  } finally {
    await prisma.$disconnect();
  }
};
