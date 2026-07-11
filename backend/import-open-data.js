const { readFileSync } = require('fs');
const { join } = require('path');
const { randomUUID } = require('crypto');
const { PrismaClient } = require('@prisma/client');

const demoPlaceNames = [
  'The Reverie Saigon',
  'La Siesta Hoi An Resort',
  'InterContinental Danang Sun Peninsula Resort',
  'Morning Glory Signature',
  'Pizza 4Ps Le Thanh Ton',
  'Bun Cha Huong Lien',
  'Ha Long Bay',
  'Trang An Landscape Complex',
  'Golden Bridge',
  'Mekong Delta Floating Market Day Trip',
  'Sapa Rice Terrace Trek',
  'Phu Quoc Sunset Cruise',
];

exports.handler = async () => {
  const prisma = new PrismaClient();
  const dataset = JSON.parse(readFileSync(join(__dirname, 'osm-places.json'), 'utf8'));

  try {
    const migration = readFileSync(join(__dirname, 'open-data-migration.sql'), 'utf8');
    for (const statement of migration.split(';').map((value) => value.trim()).filter(Boolean)) {
      await prisma.$executeRawUnsafe(statement);
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM "places" AS place
       WHERE place."owner_id" IS NULL
         AND place."name" = ANY($1::text[])
         AND NOT EXISTS (SELECT 1 FROM "reviews" WHERE "place_id" = place."id")
         AND NOT EXISTS (SELECT 1 FROM "saved_places" WHERE "place_id" = place."id")
         AND NOT EXISTS (SELECT 1 FROM "trip_places" WHERE "place_id" = place."id")
         AND NOT EXISTS (SELECT 1 FROM "bookings" WHERE "place_id" = place."id")
         AND NOT EXISTS (SELECT 1 FROM "business_claims" WHERE "place_id" = place."id")
         AND NOT EXISTS (SELECT 1 FROM "place_views" WHERE "place_id" = place."id")`,
      demoPlaceNames
    );

    let imported = 0;
    for (const place of dataset.places) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "places" (
          "id", "name", "description", "category", "city", "country", "address",
          "latitude", "longitude", "price_range", "avg_rating", "total_reviews",
          "images", "opening_hours", "amenities", "source", "source_id", "source_url",
          "license", "image_attribution", "is_verified", "created_at", "updated_at"
        ) VALUES (
          $1, $2, $3, $4::"PlaceCategory", $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13::text[], $14::jsonb, $15::jsonb, $16, $17, $18,
          $19, $20::jsonb, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT ("source", "source_id") DO UPDATE SET
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "category" = EXCLUDED."category",
          "city" = EXCLUDED."city",
          "country" = EXCLUDED."country",
          "address" = EXCLUDED."address",
          "latitude" = EXCLUDED."latitude",
          "longitude" = EXCLUDED."longitude",
          "price_range" = EXCLUDED."price_range",
          "avg_rating" = EXCLUDED."avg_rating",
          "total_reviews" = EXCLUDED."total_reviews",
          "images" = EXCLUDED."images",
          "opening_hours" = EXCLUDED."opening_hours",
          "amenities" = EXCLUDED."amenities",
          "source_url" = EXCLUDED."source_url",
          "license" = EXCLUDED."license",
          "image_attribution" = EXCLUDED."image_attribution",
          "updated_at" = CURRENT_TIMESTAMP`,
        randomUUID(),
        place.name,
        place.description,
        place.category,
        place.city,
        place.country,
        place.address || null,
        place.latitude,
        place.longitude,
        place.priceRange || null,
        place.avgRating || 0,
        place.totalReviews || 0,
        place.images || [],
        JSON.stringify(place.openingHours),
        JSON.stringify(place.amenities || {}),
        place.source,
        place.sourceId,
        place.sourceUrl,
        place.license,
        JSON.stringify(place.imageAttribution)
      );
      imported += 1;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imported, attribution: dataset.attribution, license: dataset.license }),
    };
  } finally {
    await prisma.$disconnect();
  }
};
