const { PrismaClient } = require('@prisma/client');

const places = [
  {
    name: 'The Reverie Saigon',
    description: 'A refined riverside stay in the heart of District 1, with skyline views and attentive service.',
    category: 'HOTEL',
    city: 'Ho Chi Minh City',
    address: '22-36 Nguyen Hue Boulevard, District 1',
    latitude: 10.7732,
    longitude: 106.7042,
    priceRange: '$$$$',
    avgRating: 4.8,
    totalReviews: 284,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'La Siesta Hoi An Resort',
    description: 'A calm garden resort close to Hoi An Ancient Town, ideal for a slow cultural escape.',
    category: 'HOTEL',
    city: 'Hoi An',
    address: '132 Hung Vuong Street, Thanh Ha Ward',
    latitude: 15.8892,
    longitude: 108.3235,
    priceRange: '$$$',
    avgRating: 4.7,
    totalReviews: 196,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'InterContinental Danang Sun Peninsula Resort',
    description: 'A secluded luxury retreat between rainforest and sea on the Son Tra Peninsula.',
    category: 'HOTEL',
    city: 'Da Nang',
    address: 'Bai Bac, Son Tra Peninsula',
    latitude: 16.1168,
    longitude: 108.3042,
    priceRange: '$$$$',
    avgRating: 4.9,
    totalReviews: 341,
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Morning Glory Signature',
    description: 'Modern Vietnamese cooking inspired by Hoi An market flavours in a warm heritage setting.',
    category: 'RESTAURANT',
    city: 'Hoi An',
    address: '41 Nguyen Phuc Chu Street, An Hoi',
    latitude: 15.8801,
    longitude: 108.3278,
    priceRange: '$$',
    avgRating: 4.6,
    totalReviews: 522,
    images: ['https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Pizza 4Ps Le Thanh Ton',
    description: 'A lively favourite for wood-fired pizza, handmade cheese, and thoughtful seasonal dishes.',
    category: 'RESTAURANT',
    city: 'Ho Chi Minh City',
    address: '8/15 Le Thanh Ton Street, District 1',
    latitude: 10.7807,
    longitude: 106.7044,
    priceRange: '$$',
    avgRating: 4.7,
    totalReviews: 631,
    images: ['https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Bun Cha Huong Lien',
    description: 'A Hanoi classic for grilled pork, rice noodles, fresh herbs, and a generous dipping broth.',
    category: 'RESTAURANT',
    city: 'Hanoi',
    address: '24 Le Van Huu Street, Hai Ba Trung',
    latitude: 21.0127,
    longitude: 105.8495,
    priceRange: '$',
    avgRating: 4.5,
    totalReviews: 418,
    images: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Ha Long Bay',
    description: 'A UNESCO seascape of limestone islands, hidden caves, and tranquil emerald water.',
    category: 'ATTRACTION',
    city: 'Ha Long',
    address: 'Quang Ninh Province',
    latitude: 20.9101,
    longitude: 107.1839,
    priceRange: '$$',
    avgRating: 4.8,
    totalReviews: 912,
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Trang An Landscape Complex',
    description: 'Glide through limestone waterways and ancient valleys in the landscape of Ninh Binh.',
    category: 'ATTRACTION',
    city: 'Ninh Binh',
    address: 'Hoa Lu District, Ninh Binh Province',
    latitude: 20.2527,
    longitude: 105.9131,
    priceRange: '$$',
    avgRating: 4.8,
    totalReviews: 367,
    images: ['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Golden Bridge',
    description: 'Walk above the Ba Na Hills on the iconic bridge held by giant stone hands.',
    category: 'ATTRACTION',
    city: 'Da Nang',
    address: 'Ba Na Hills, Hoa Vang District',
    latitude: 15.9979,
    longitude: 107.9962,
    priceRange: '$$',
    avgRating: 4.6,
    totalReviews: 748,
    images: ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Mekong Delta Floating Market Day Trip',
    description: 'A full-day journey through canals, orchards, local workshops, and a floating market.',
    category: 'TOUR',
    city: 'Can Tho',
    address: 'Cai Rang Floating Market',
    latitude: 10.0357,
    longitude: 105.7847,
    priceRange: '$$',
    avgRating: 4.7,
    totalReviews: 259,
    images: ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Sapa Rice Terrace Trek',
    description: 'Trek through mountain villages, rice terraces, and misty valleys with a local guide.',
    category: 'TOUR',
    city: 'Sapa',
    address: 'Sapa Town, Lao Cai Province',
    latitude: 22.3364,
    longitude: 103.8438,
    priceRange: '$$',
    avgRating: 4.8,
    totalReviews: 305,
    images: ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    name: 'Phu Quoc Sunset Cruise',
    description: 'An easygoing sunset sail with island views, snorkelling stops, and dinner on board.',
    category: 'TOUR',
    city: 'Phu Quoc',
    address: 'Duong Dong Harbour, Phu Quoc',
    latitude: 10.227,
    longitude: 103.9672,
    priceRange: '$$$',
    avgRating: 4.6,
    totalReviews: 174,
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85'],
  },
];

exports.handler = async () => {
  const prisma = new PrismaClient();

  try {
    let created = 0;
    let updated = 0;

    for (const place of places) {
      const existing = await prisma.place.findFirst({ where: { name: place.name } });

      if (existing) {
        await prisma.place.update({ where: { id: existing.id }, data: place });
        updated += 1;
      } else {
        await prisma.place.create({ data: place });
        created += 1;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ created, updated, total: places.length }),
    };
  } finally {
    await prisma.$disconnect();
  }
};
