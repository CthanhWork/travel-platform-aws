const { readFileSync } = require('fs');
const { join } = require('path');
const { PrismaClient } = require('@prisma/client');

exports.handler = async () => {
  const prisma = new PrismaClient();

  try {
    const sql = readFileSync(join(__dirname, 'migration.sql'), 'utf8');
    const statements = sql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }

    return { statusCode: 200, body: JSON.stringify({ statementsApplied: statements.length }) };
  } finally {
    await prisma.$disconnect();
  }
};
