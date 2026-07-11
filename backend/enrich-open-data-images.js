const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const DATA_FILE = join(__dirname, 'osm-places.json');
const USER_AGENT = 'TravelPlatformAWS/1.0 (open-data image enrichment)';
const ALLOWED_LICENSE = /^(CC BY|CC BY-SA|CC0|Public domain|Public Domain|PDM)/i;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const normalizeWords = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

const findImage = async (place) => {
  const query = `${place.name} ${place.city} Vietnam`;
  const directImage = place.images[0];
  const directFileName = directImage?.includes('/Special:FilePath/')
    ? decodeURIComponent(directImage.split('/Special:FilePath/').pop())
    : null;
  const params = new URLSearchParams({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  });
  if (directFileName) {
    params.set('titles', `File:${directFileName}`);
  } else {
    params.set('generator', 'search');
    params.set('gsrsearch', query);
    params.set('gsrnamespace', '6');
    params.set('gsrlimit', '3');
  }
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const data = await response.json();
  const nameWords = normalizeWords(place.name);
  const pages = Object.values(data.query?.pages || {})
    .map((page) => ({
      page,
      score: normalizeWords(page.title).filter((word) => nameWords.includes(word)).length,
    }))
    .sort((left, right) => right.score - left.score);

  for (const { page, score } of pages) {
    const imageInfo = page.imageinfo?.[0];
    const metadata = imageInfo?.extmetadata || {};
    const license = metadata.LicenseShortName?.value || metadata.UsageTerms?.value || '';
    if (!imageInfo || (!directFileName && score === 0) || !ALLOWED_LICENSE.test(license)) continue;

    return {
      url: (imageInfo.thumburl || imageInfo.url).replace(/^http:/, 'https:'),
      attribution: {
        title: metadata.ObjectName?.value || page.title.replace(/^File:/, ''),
        creator: stripHtml(metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia contributor'),
        license,
        licenseUrl: metadata.LicenseUrl?.value || null,
        source: 'Wikimedia Commons',
        sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      },
    };
  }

  return null;
};

const main = async () => {
  const dataset = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  const candidates = dataset.places
    .filter(
      (place) =>
        place.images.length === 0 ||
        place.imageAttribution?.license === 'See Wikimedia Commons file page'
    )
    .sort((left, right) => {
      const priority = { ATTRACTION: 0, TOUR: 1, HOTEL: 2, RESTAURANT: 3 };
      return priority[left.category] - priority[right.category];
    })
    .slice(0, 140);

  let enriched = 0;
  for (let index = 0; index < candidates.length; index += 4) {
    const batch = candidates.slice(index, index + 4);
    const results = await Promise.all(batch.map(findImage));

    results.forEach((result, resultIndex) => {
      if (!result) return;
      batch[resultIndex].images = [result.url];
      batch[resultIndex].imageAttribution = result.attribution;
      enriched += 1;
    });
    await sleep(250);
  }

  for (const place of dataset.places) {
    if (place.imageAttribution?.license === 'See Wikimedia Commons file page') {
      place.images = [];
      place.imageAttribution = null;
    }
  }

  writeFileSync(DATA_FILE, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  process.stdout.write(`Added ${enriched} Wikimedia Commons images.\n`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
