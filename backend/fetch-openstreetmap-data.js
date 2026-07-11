const { writeFileSync } = require('fs');
const { join } = require('path');

const OVERPASS_URL = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';
const USER_AGENT = 'TravelPlatformAWS/1.0 (open-data importer)';
const OUTPUT_FILE = join(__dirname, 'osm-places.json');

const cities = [
  { name: 'Hanoi', lat: 21.0278, lon: 105.8342, radius: 25000 },
  { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, radius: 30000 },
  { name: 'Da Nang', lat: 16.0544, lon: 108.2022, radius: 22000 },
  { name: 'Hoi An', lat: 15.8801, lon: 108.338, radius: 12000 },
  { name: 'Hue', lat: 16.4637, lon: 107.5909, radius: 18000 },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967, radius: 18000 },
  { name: 'Da Lat', lat: 11.9404, lon: 108.4583, radius: 18000 },
  { name: 'Phu Quoc', lat: 10.2899, lon: 103.984, radius: 30000 },
  { name: 'Sapa', lat: 22.3364, lon: 103.8438, radius: 15000 },
  { name: 'Ninh Binh', lat: 20.2506, lon: 105.9745, radius: 22000 },
];

const categories = [
  {
    name: 'HOTEL',
    selector: '["tourism"~"^(hotel|hostel|guest_house|resort|motel|apartment)$"]',
    limit: 9,
  },
  {
    name: 'RESTAURANT',
    selector: '["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]',
    limit: 9,
  },
  {
    name: 'ATTRACTION',
    selector: '["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park)$"]',
    limit: 9,
  },
  {
    name: 'TOUR',
    selector: '["shop"="travel_agency"]',
    additionalSelectors: [
      '["leisure"~"^(water_park|amusement_park)$"]',
      '["sport"~"^(scuba_diving|surfing|climbing|canoe|kayak)$"]',
      '["tourism"="information"]["information"~"^(office|tour)$"]',
    ],
    limit: 7,
  },
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchJson = async (url, options = {}, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...options.headers },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 5000);
    }
  }

  throw lastError;
};

const buildAddress = (tags) => {
  if (tags['addr:full']) return tags['addr:full'];

  return [tags['addr:housenumber'], tags['addr:street'], tags['addr:district']]
    .filter(Boolean)
    .join(' ');
};

const genericDescription = (category, city) => {
  const descriptions = {
    HOTEL: `Accommodation in ${city} listed by OpenStreetMap contributors.`,
    RESTAURANT: `A food and drink venue in ${city} listed by OpenStreetMap contributors.`,
    ATTRACTION: `A visitor attraction in ${city} listed by OpenStreetMap contributors.`,
    TOUR: `A travel activity or tour service in ${city} listed by OpenStreetMap contributors.`,
  };
  return descriptions[category];
};

const normalizeElement = (element, category, city) => {
  const tags = element.tags || {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (!tags.name || latitude === undefined || longitude === undefined) return null;

  return {
    source: 'openstreetmap',
    sourceId: `${element.type}/${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    license: 'ODbL-1.0',
    name: tags['name:en'] || tags.name,
    localName: tags.name,
    description: tags['description:en'] || tags.description || genericDescription(category, city.name),
    category,
    city: city.name,
    country: 'Vietnam',
    address: buildAddress(tags),
    latitude,
    longitude,
    priceRange: null,
    website: tags.website || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null,
    openingHours: tags.opening_hours || null,
    amenities: {
      cuisine: tags.cuisine || null,
      stars: tags.stars || null,
      wheelchair: tags.wheelchair || null,
      internetAccess: tags.internet_access || null,
      wikidata: tags.wikidata || null,
    },
    wikidataId: tags.wikidata || null,
    images: [],
    imageAttribution: null,
  };
};

const detectCategory = (tags = {}) => {
  if (/^(hotel|hostel|guest_house|resort|motel|apartment)$/.test(tags.tourism || '')) return 'HOTEL';
  if (/^(restaurant|cafe|fast_food|food_court)$/.test(tags.amenity || '')) return 'RESTAURANT';
  if (
    tags.shop === 'travel_agency' ||
    /^(water_park|amusement_park)$/.test(tags.leisure || '') ||
    /^(scuba_diving|surfing|climbing|canoe|kayak)$/.test(tags.sport || '') ||
    (tags.tourism === 'information' && /^(office|tour)$/.test(tags.information || ''))
  ) return 'TOUR';
  if (/^(attraction|museum|viewpoint|gallery|zoo|theme_park)$/.test(tags.tourism || '')) return 'ATTRACTION';
  return null;
};

const fetchCityPlaces = async (city) => {
  const selectors = categories.flatMap((category) => [
    category.selector,
    ...(category.additionalSelectors || []),
  ]);
  const clauses = selectors.map(
    (selector) => `nwr${selector}["name"](around:${city.radius},${city.lat},${city.lon});`
  );
  const query = `[out:json][timeout:60];\n(${clauses.join('\n')}\n);\nout center 500;`;
  const body = new URLSearchParams({ data: query });
  const data = await fetchJson(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (data.remark || !data.elements?.length) {
    throw new Error(data.remark || `No OpenStreetMap elements returned for ${city.name}`);
  }

  const groups = new Map();

  for (const element of data.elements) {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    const category = detectCategory(element.tags);
    if (latitude === undefined || longitude === undefined || !category) continue;

    const normalized = normalizeElement(element, category, city);
    if (!normalized) continue;

    const key = `${city.name}:${category}`;
    const group = groups.get(key) || [];
    const limit = categories.find((item) => item.name === category).limit;
    if (group.length < limit) {
      group.push(normalized);
      groups.set(key, group);
    }
  }

  return [...groups.values()].flat();
};

const fetchAllPlaces = async () => {
  const places = [];

  for (let index = 0; index < cities.length; index += 2) {
    const batch = cities.slice(index, index + 2);
    const results = await Promise.all(batch.map(fetchCityPlaces));
    results.forEach((cityPlaces, resultIndex) => {
      places.push(...cityPlaces);
      process.stdout.write(`${batch[resultIndex].name}: ${cityPlaces.length} selected\n`);
    });
    await sleep(2000);
  }

  return places;
};

const enrichFromWikidata = async (places) => {
  const ids = [...new Set(places.map((place) => place.wikidataId).filter(Boolean))];

  for (let index = 0; index < ids.length; index += 40) {
    const batch = ids.slice(index, index + 40);
    const values = batch.map((id) => `wd:${id}`).join(' ');
    const query = `
      SELECT ?item ?itemDescription ?image ?website WHERE {
        VALUES ?item { ${values} }
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P856 ?website. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,vi". }
      }
    `;
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const data = await fetchJson(url);

    for (const binding of data.results.bindings) {
      const id = binding.item.value.split('/').pop();
      const matches = places.filter((place) => place.wikidataId === id);

      for (const place of matches) {
        if (binding.itemDescription?.value) place.description = binding.itemDescription.value;
        if (!place.website && binding.website?.value) place.website = binding.website.value;
        if (binding.image?.value) {
          place.images = [binding.image.value.replace(/^http:/, 'https:')];
          place.imageAttribution = {
            source: 'Wikimedia Commons',
            sourceUrl: binding.image.value,
            license: 'See Wikimedia Commons file page',
          };
        }
      }
    }

    await sleep(500);
  }
};

const main = async () => {
  const places = await fetchAllPlaces();
  const uniquePlaces = [...new Map(places.map((place) => [place.sourceId, place])).values()];
  for (const city of cities) {
    for (const category of categories) {
      const count = uniquePlaces.filter(
        (place) => place.city === city.name && place.category === category.name
      ).length;
      process.stdout.write(`${city.name} ${category.name}: ${count}\n`);
    }
  }
  await enrichFromWikidata(uniquePlaces);

  const dataset = {
    generatedAt: new Date().toISOString(),
    attribution: '© OpenStreetMap contributors',
    license: 'ODbL-1.0',
    places: uniquePlaces.slice(0, 300),
  };

  writeFileSync(OUTPUT_FILE, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  process.stdout.write(`Saved ${dataset.places.length} places to ${OUTPUT_FILE}\n`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
