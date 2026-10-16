import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const brainDir = 'C:/Users/einst/.gemini/antigravity-ide/brain/928ac5fa-a0d8-40ab-abeb-8ca65a8329ae';
const uploadDir = path.resolve('public/uploads');

const conversionMap = [
  // Chocolates
  { src: path.join(brainDir, 'dark_cocoa_bar_1792183015218.jpg'), dest: 'prod-dark-cocoa-artisan-bar.webp' },
  { src: path.join(brainDir, 'white_choco_passion_1792183048626.jpg'), dest: 'prod-white-chocolate-passionfruit.webp' },
  { src: path.join(brainDir, 'dark_praline_truffles_1792183071137.jpg'), dest: 'prod-dark-chocolate-truffles-box8.webp' },
  { src: path.join(brainDir, 'milk_choco_coconut_1792183091117.jpg'), dest: 'prod-milk-chocolate-coconut-seasalt.webp' },
  { src: path.join(brainDir, 'dark_gift_box_1792183114847.jpg'), dest: 'prod-dark-cocoa-gift-box-4bars.webp' },
  { src: path.join(brainDir, 'chili_ginger_choco_1792183141365.jpg'), dest: 'prod-chili-ginger-dark-chocolate.webp' },

  // Cashews
  { src: path.join(brainDir, 'choco_cashew_praline_1792183167339.jpg'), dest: 'prod-dark-chocolate-dipped-cashews.webp' },
  { src: path.join(brainDir, 'hot_chili_cashews_1792183212484.jpg'), dest: 'prod-hot-chili-cayenne-cashews.webp' },
  { src: path.join(brainDir, 'raw_cashews_1792183262004.jpg'), dest: 'prod-raw-organic-whole-cashews.webp' },
  { src: path.join(brainDir, 'sea_salt_cashews_1792183354985.jpg'), dest: 'prod-slow-roasted-seasalt-cashews.webp' },
  { src: path.join(brainDir, 'paprika_cashews_1792183386041.jpg'), dest: 'prod-smoked-paprika-garlic-cashews.webp' },

  // Dried Fruits
  { src: path.join(brainDir, 'dried_pineapple_rings_1792183496398.jpg'), dest: 'prod-sundried-pineapple-rings.webp' },
  { src: path.join(brainDir, 'plantain_chips_1792183537621.jpg'), dest: 'prod-crispy-plantain-chips.webp' },
  { src: path.join(uploadDir, 'cand_papaya.webp'), dest: 'prod-sundried-papaya-chunks.webp' },
  { src: path.join(uploadDir, 'cand_mango3.webp'), dest: 'prod-sundried-volta-mango-strips.webp' },
  { src: path.join(uploadDir, 'cand_toasted_coconut.webp'), dest: 'prod-toasted-coconut-chips.webp' },
  { src: path.join(uploadDir, 'cand_trailmix2.webp'), dest: 'prod-tropical-harvest-trail-mix.webp' },

  // Teas
  { src: path.join(uploadDir, 'cand_chamomile3.webp'), dest: 'prod-chamomile-soursop-brew.webp' },
  { src: path.join(uploadDir, 'cand_cocoabeans_roasted.webp'), dest: 'prod-roasted-cocoa-shell-tea.webp' }
];

async function run() {
  for (const item of conversionMap) {
    const destPath = path.join(uploadDir, item.dest);
    if (!fs.existsSync(item.src)) {
      console.error('Source does not exist:', item.src);
      continue;
    }
    if (item.src.endsWith('.jpg')) {
      await sharp(item.src)
        .resize(800, 800, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(destPath);
    } else {
      fs.copyFileSync(item.src, destPath);
    }
    console.log(`Processed ${item.dest} (${fs.statSync(destPath).size} bytes)`);
  }
}

run();
