import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve('public/uploads');

const TARGETS = [
  {
    filename: 'prod-kente-cloth-12yards.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Different_Kente_cloth%2C_Tafi%2C_Volta_region.jpg'
  },
  {
    filename: 'prod-kente-shawl.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Traditional_Kente_of_Volta_region.jpg'
  },
  {
    filename: 'prod-kente-stole.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/2019_Kente_Festival_06.jpg'
  },
  {
    filename: 'prod-kente-tie.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Ewe_kente_2%2C_Ghana.JPG'
  },
  {
    filename: 'prod-ahenema-slippers.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Ahenema_slippers.jpg'
  },
  {
    filename: 'prod-whipped-shea-butter.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/M%C3%A9lange_du_Beurre_de_karit%C3%A9_et_huiles_essentielles_dans_une_boite_pour_massage_02.jpg'
  },
  {
    filename: 'prod-alata-samina-paste.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/African_Black_Soap.jpg'
  },
  {
    filename: 'prod-shito-authentic-jar.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Kenkey_and_Shito_%28Chili%29.jpg'
  },
  {
    filename: 'prod-prekese-spice.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Tetrapleura_tetraptera_MHNT.BOT.2017.10.22.jpg'
  },
  {
    filename: 'prod-iphone-13-pro.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Back_of_the_iPhone_13_Pro.jpg'
  },
  {
    filename: 'prod-anker-powerbank.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/2023_Powerbank_Anker_Powercore_5000mAh.jpg'
  }
];

async function run() {
  for (const t of TARGETS) {
    const dest = path.join(UPLOAD_DIR, t.filename);
    try {
      console.log('Fetching', t.filename, 'from', t.url);
      const res = await fetch(t.url, { headers: { 'User-Agent': 'TheUltimateMall/1.0 (info@ultimatemall.gh)' } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        await sharp(buf)
          .resize(800, 800, { fit: 'cover' })
          .webp({ quality: 85 })
          .toFile(dest);
        console.log('  -> Saved', t.filename, `(${fs.statSync(dest).size} bytes)`);
      } else {
        console.warn('  -> HTTP Error:', res.status, res.statusText);
      }
    } catch (e) {
      console.error('  -> Failed:', e.message);
    }
  }
}

run();
