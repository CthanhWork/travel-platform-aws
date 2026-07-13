const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const dataFile = join(__dirname, 'osm-places.json');

const fallbackImages = {
  HOTEL: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
  ],
  RESTAURANT: [
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=85',
  ],
  ATTRACTION: [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85',
  ],
  TOUR: [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85',
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

const productDetails = {
  HOTEL: {
    copy: 'Guests can use this listing to compare the setting, typical price level, opening information, and location before requesting a stay.',
    highlights: ['Comfortable stay', 'Convenient location', 'Traveler-friendly service'],
    amenities: ['Wi-Fi', 'Reception support', 'Local information'],
  },
  RESTAURANT: {
    copy: 'A useful stop for travelers who want to explore local dining, plan a meal, and request a table for their preferred date.',
    highlights: ['Local flavors', 'Group friendly', 'Easy booking request'],
    amenities: ['Dining area', 'Group seating', 'Local menu'],
  },
  ATTRACTION: {
    copy: 'Plan time for sightseeing, photography, and discovering the surrounding area. Check local conditions before visiting.',
    highlights: ['Photo opportunities', 'Cultural interest', 'Independent visit'],
    amenities: ['Visitor access', 'Photo spots', 'Nearby services'],
  },
  TOUR: {
    copy: 'Designed as a bookable travel experience with local context, flexible group sizes, and space for special requests.',
    highlights: ['Guided experience', 'Local insight', 'Small groups'],
    amenities: ['Local guide', 'Planned itinerary', 'Booking support'],
  },
};

for (const place of dataset.places) {
  const seed = hash(place.sourceId);
  const images = fallbackImages[place.category];
  const prices = priceRanges[place.category];

  const gallery = Array.from({ length: 5 }, (_, index) => images[(seed + index) % images.length]);
  if (!place.images?.length) {
    place.images = gallery;
    place.imageAttribution = { source: 'Demo fallback image' };
  } else {
    place.images = [...new Set([...place.images, ...gallery])].slice(0, 5);
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
    highlights: productDetails[place.category].highlights,
    facilities: productDetails[place.category].amenities,
    demoData: true,
  };
  if (!place.description.includes(productDetails[place.category].copy)) {
    place.description = `${place.description} ${productDetails[place.category].copy}`;
  }
}

writeFileSync(dataFile, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
console.log(`Prepared ${dataset.places.length} demo-ready places.`);
