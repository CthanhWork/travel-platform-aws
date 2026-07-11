/**
 * Run Prisma migration on Lambda
 * This is a one-time script to create tables
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function runMigration() {
  try {
    console.log('Starting migration...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Run raw SQL to create tables
    await prisma.$executeRawUnsafe(`
      -- CreateEnum
      CREATE TYPE "UserRole" AS ENUM ('USER', 'BUSINESS_OWNER', 'ADMIN');

      -- CreateEnum
      CREATE TYPE "BusinessStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

      -- CreateEnum
      CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

      -- CreateEnum
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

      -- CreateTable
      CREATE TABLE "users" (
          "id" TEXT NOT NULL,
          "cognito_sub" TEXT,
          "email" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "full_name" TEXT NOT NULL,
          "avatar_url" TEXT,
          "role" "UserRole" NOT NULL DEFAULT 'USER',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE "business_profiles" (
          "id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "business_name" TEXT NOT NULL,
          "description" TEXT,
          "address" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "website" TEXT,
          "status" "BusinessStatus" NOT NULL DEFAULT 'PENDING',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE "tours" (
          "id" TEXT NOT NULL,
          "business_id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "location" TEXT NOT NULL,
          "price" DECIMAL(10,2) NOT NULL,
          "duration" TEXT NOT NULL,
          "max_participants" INTEGER NOT NULL,
          "image_urls" TEXT[],
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE "bookings" (
          "id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "tour_id" TEXT NOT NULL,
          "booking_date" TIMESTAMP(3) NOT NULL,
          "participants" INTEGER NOT NULL,
          "total_price" DECIMAL(10,2) NOT NULL,
          "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE "payments" (
          "id" TEXT NOT NULL,
          "booking_id" TEXT NOT NULL,
          "amount" DECIMAL(10,2) NOT NULL,
          "payment_method" TEXT NOT NULL,
          "stripe_payment_id" TEXT,
          "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE "reviews" (
          "id" TEXT NOT NULL,
          "tour_id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "rating" INTEGER NOT NULL,
          "comment" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX "users_cognito_sub_key" ON "users"("cognito_sub");

      -- CreateIndex
      CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

      -- CreateIndex
      CREATE UNIQUE INDEX "business_profiles_user_id_key" ON "business_profiles"("user_id");

      -- CreateIndex
      CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

      -- AddForeignKey
      ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "tours" ADD CONSTRAINT "tours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `);

    console.log('✅ Migration completed successfully!');

    // Verify tables created
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('✅ Tables created:', tables);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for Lambda or run directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { handler: runMigration };
