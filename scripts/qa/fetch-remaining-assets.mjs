import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve('public/uploads');

async function searchAndDownload(query, filename) {
  try {
    const searchUrl = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&srnamespace=6&format=json&srlimit=5';
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'TheUltimateMall/1.0 (info@ultimatemall.gh)' } });
    const data = await res.json();
    const searchResults = data.query?.search;
    if (!searchResults || searchResults.length === 0) {
      console.warn(`No search results for "${query}"`);
      return false;
    }

    // Try each search result until one downloads cleanly
    for (const item of searchResults) {
      const fileTitle = item.title;
      // Skip video or audio files
      if (fileTitle.endsWith('.webm') || fileTitle.endsWith('.ogg') || fileTitle.endsWith('.mp3')) continue;

      const infoUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url|mime|size&format=json';
      const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': 'TheUltimateMall/1.0 (info@ultimatemall.gh)' } });
      const infoData = await infoRes.json();
      const pages = infoData.query?.pages;
      const pageId = Object.keys(pages)[0];
      const imgUrl = pages[pageId]?.imageinfo?.[0]?.url;

      if (!imgUrl) continue;

      console.log(`Downloading "${fileTitle}" from ${imgUrl}`);
      const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'TheUltimateMall/1.0 (info@ultimatemall.gh)' } });
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        const dest = path.join(UPLOAD_DIR, filename);
        await sharp(buf)
          .resize(800, 800, { fit: 'cover' })
          .webp({ quality: 85 })
          .toFile(dest);
        console.log(`Successfully saved ${filename} (${fs.statSync(dest).size} bytes)`);
        return true;
      }
    }
  } catch (err) {
    console.error(`Error processing "${query}":`, err.message);
  }
  return false;
}

const ITEMS = [
  { q: 'Adinkra symbol Ghana', file: 'prod-adinkra-canvas-art.webp' },
  { q: 'Hibiscus tea dried flowers', file: 'prod-sobolo-hibiscus-brew.webp' },
  { q: 'Lemongrass herbal tea', file: 'prod-ginger-lemongrass-tin.webp' },
  { q: 'Roasted cashew nuts', file: 'prod-honey-roasted-cashews.webp' },
  { q: 'Activated charcoal soap bar', file: 'prod-charcoal-black-soap.webp' },
  { q: 'Hair mask deep conditioner', file: 'prod-avocado-hair-mask.webp' },
  { q: 'Sugar body scrub glass jar', file: 'prod-rosehip-glow-polish.webp' },
  { q: 'Hot chili pepper sauce jar', file: 'prod-smoked-crayfish-shito.webp' },
  { q: 'Shiitake mushroom condiment jar', file: 'prod-vegetarian-shiitake-shito.webp' },
  { q: 'Kente cloth Ashanti Ghana', file: 'prod-oyokoman-kente-shawl.webp' },
  { q: 'African beaded leather sandals', file: 'prod-beaded-leather-sandals.webp' },
  { q: 'Ahenema sandals Ghana', file: 'prod-ahenema-royal-slippers.webp' }
];

async function run() {
  for (const item of ITEMS) {
    await searchAndDownload(item.q, item.file);
  }
}

run();
