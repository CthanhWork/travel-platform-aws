/**
 * Deploy Prisma migrations via Lambda
 */

const { execSync } = require('child_process');

exports.handler = async (event) => {
  try {
    console.log('Starting Prisma migration deployment...');

    // Run prisma migrate deploy
    const output = execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      },
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log('Migration output:', output);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Migrations deployed successfully',
        output: output
      })
    };

  } catch (error) {
    console.error('Migration failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stderr: error.stderr?.toString(),
        stdout: error.stdout?.toString()
      })
    };
  }
};
