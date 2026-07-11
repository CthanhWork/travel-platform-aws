const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const dataFile = join(__dirname, 'osm-places.json');

const fallbackImages = {
  HOTEL: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
  ],
  RESTAURANT: [
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=85',
  ],
  ATTRACTION: [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
  ],
  TOUR: [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
  ],
};

const priceRanges = {
  HOTEL: ['$$', '$$$', '$$$$'],
  RESTAURANT: ['$', '$$', '$$$'],
  ATTRACTION: ['$', '$$', '$$'],
  TOUR: ['$$', '$$$', '$$$'],
};

const hash = (value) => {
  let result = 0;
  for (const character of value) {
    result = (result * 31 + character.charCodeAt(0)) >>> 0;
  }
  return result;
};

const dataset = JSON.parse(readFileSync(dataFile, 'utf8'));

for (const place of dataset.places) {
  const seed = hash(place.sourceId);
  const images = fallbackImages[place.category];
  const prices = priceRanges[place.category];

  if (!place.images?.length) {
    place.images = [images[seed % images.length]];
    place.imageAttribution = { source: 'Demo fallback image' };
  }

  place.priceRange ||= prices[seed % prices.length];
  place.avgRating = Number((4 + (seed % 10) / 10).toFixed(1));
  place.totalReviews = 20 + (seed % 480);
  place.openingHours ||= {
    weekdays: '08:00-22:00',
    weekends: '08:00-23:00',
  };
  place.amenities = {
    ...(place.amenities || {}),
    demoData: true,
  };
}

writeFileSync(dataFile, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
console.log(`Prepared ${dataset.places.length} demo-ready places.`);
