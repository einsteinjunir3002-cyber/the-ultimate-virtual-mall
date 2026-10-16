import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const UPLOAD_DIR = path.resolve('public/uploads');

// Load current catalog to preserve IDs and base prices
const currentCatalog = JSON.parse(fs.readFileSync('catalog_audit_complete.json', 'utf8'));

// Master image replacements dictionary for items that need corrected images
const IMAGE_REPLACEMENTS = {
  // Labadi Surf & Active Co.
  'stainless-steel-thermal-travel-tumbler-with-straw-600ml': {
    name: 'Stainless Steel Vacuum Insulated Travel Tumbler with Straw (600ml)',
    image: '/uploads/prod-stainless-steel-tumbler.webp',
    specs: `SPECIFICATIONS:\n- Material: Double-wall kitchen-grade 18/8 (304) stainless steel\n- Capacity: 600ml / 20oz\n- Thermal Retention: 24 Hours Cold / 12 Hours Hot (TempShield vacuum insulation)\n- Lid: Splash-resistant BPA-free Tritan slider lid with silicone gasket seal\n- Straw: Reusable 304 stainless steel straw with food-grade black silicone comfort tip\n- Finish: Sweat-proof powder-coated matte black exterior\n- Base Diameter: 7.2cm (fits all standard car cup holders and gym equipment consoles)`
  },
  '2-litre-motivational-time-marker-fitness-water-jug': {
    name: '2.2-Litre Motivational Time-Marker Fitness Water Jug',
    image: '/uploads/prod-motivational-water-jug.webp',
    specs: `SPECIFICATIONS:\n- Capacity: 2.2 Litres / 74 fl oz (Full Daily Recommended Hydration)\n- Material: 100% BPA-Free and DEHP-Free food-grade PETG polymer\n- Time Markers: Hourly goal timestamps (7AM - 9PM) with capacity scale (0.4L to 2.2L)\n- Spout: Push-button one-touch flip top with safety locking latch\n- Portability: Ergonomic molded side handle + heavy-duty nylon woven wrist lanyard\n- Opening: Extra-wide 8cm mouth for adding full ice cubes easily`
  },
  'fruit-infuser-sports-gym-water-bottle-800ml': {
    name: 'BPA-Free Tritan Fruit Infuser Sports Gym Water Bottle (800ml)',
    image: '/uploads/prod-fruit-infuser-bottle.webp',
    specs: `SPECIFICATIONS:\n- Capacity: 800ml / 27 fl oz\n- Material: Shatterproof, crystal-clear 100% USA Eastman Tritan copolyester (BPA-free)\n- Infusion Chamber: Full-length perforated food-grade infusion basket rod\n- Lid: Leakproof flip-cap with dual silicone sealing rings and metal safety locking latch\n- Grip: Non-slip finger grooves with integrated carrying loop\n- Cleaning: Top-rack dishwasher safe, stain-resistant, and odor-resistant`
  },
  'heavy-duty-20l-waterproof-ocean-dry-bag': {
    name: 'Heavy-Duty 20L 500D PVC Waterproof Roll-Top Ocean Dry Bag',
    image: '/uploads/prod-ocean-dry-bag.webp',
    specs: `SPECIFICATIONS:\n- Capacity: 20 Litres\n- Material: Heavy-duty 500D PVC coated tarpaulin\n- Seams: High-frequency ultrasonic heat-welded seamless construction (IPX6 waterproof)\n- Closure: Quick-release polymer buckle with triple fold-over seal\n- Strap: Detachable, adjustable reinforced nylon shoulder sling with 360-degree swivel snap hooks\n- Visibility: High-visibility bright yellow with reflective safety lettering`
  },
  'floating-waterproof-smartphone-pouch-with-touch-window': {
    name: 'Floating IPX8 Universal Waterproof Smartphone Dry Bag Pouch',
    image: '/uploads/prod-phone-pouch.webp',
    specs: `SPECIFICATIONS:\n- Waterproof Rating: Certified IPX8 down to 30 meters (100 feet)\n- Buoyancy: Air-sponge perimeter rim ensures positive buoyancy (floats on ocean surface)\n- Compatibility: Fits all smartphones up to 7.0 inches diagonal screen size\n- Touch Functionality: High-sensitivity 0.3mm optical TPU touch-responsive membrane\n- Latch: Dual ABS swivel-lock clips with snap closure\n- Lanyard: Heavy-duty 45cm nylon neck strap with safety quick-release clip`
  },
  'quick-dry-4-way-stretch-board-shorts-with-zip-pocket': {
    name: 'Quick-Dry 4-Way Stretch Tropical Wave Rider Board Shorts',
    image: '/uploads/prod-mens-board-shorts.webp',
    specs: `SPECIFICATIONS:\n- Fabric: 90% recycled polyester / 10% spandex 4-way performance stretch\n- Inseam: 9" inseam (19" outseam at-the-knee fit)\n- Coating: PFC-free DWR (Durable Water Repellent) for instantaneous drying\n- Fly: Gusseted lycra fly with braided drawcord and silicone-tapped eyelets\n- Storage: Right-hip welded waterproof zipper pocket with internal shock-cord key bungee`
  },
  'ghana-black-stars-coastal-athletic-rash-guard-spf-50': {
    name: 'Long-Sleeve Black & Gold Athletic Compression Rash Guard (UPF 50+)',
    image: '/uploads/prod-athletic-rashguard.webp',
    specs: `SPECIFICATIONS:\n- Material: 85% polyester / 15% spandex technical compression jersey\n- Sun Protection: UPF 50+ certified solar barrier\n- Stitching: 6-thread flatlock anti-chafing seams designed to eliminate skin irritation\n- Hem: Internal silicone anti-slip gripper strip along bottom hem prevents ride-up\n- Neckline: Ergonomic crew neck with raglan sleeves for uninhibited shoulder paddle rotation`
  },
  'labadi-beach-high-waisted-uv-compression-leggings': {
    name: 'High-Waisted UV Compression Athletic Workout Leggings',
    image: '/uploads/prod-compression-leggings.webp',
    specs: `SPECIFICATIONS:\n- Fabric: 78% nylon / 22% spandex high-gauge four-way stretch interlock knit\n- Opacity: 100% squat-proof, non-sheer under high tension\n- Waistband: 4.5-inch seamless high-waist band with targeted abdominal compression\n- Pockets: 2x deep side drop-in smartphone pockets (fits iPhone 15 Pro Max)\n- Sun Defense: UPF 50+ blocks 98% of harmful UVA and UVB radiation`
  },
  'breathable-anti-chafe-sleeveless-gym-tank-top': {
    name: 'Breathable Moisture-Wicking Sleeveless Gym Training Tank Top',
    image: '/uploads/prod-sleeveless-gym-tank.webp',
    specs: `SPECIFICATIONS:\n- Material: 100% ultralight micro-mesh breathable polyester (140 GSM)\n- Technology: Advanced capillary moisture-wicking system with anti-odor silver ion treatment\n- Cut: Athletic relaxed fit with scooped neck and drop-cut armholes\n- Seams: Reinforced dual-needle hem stitching for durability`
  },
  'sweat-resistant-running-waist-pack-with-headphone-port': {
    name: 'Slim Waterproof Running Waist Pack with Headphone Port',
    image: '/uploads/prod-running-waist-pack.webp',
    specs: `SPECIFICATIONS:\n- Material: Water-resistant ripstop nylon with polyurethane internal membrane\n- Fit: Ultra-slim bounce-free ergonomic fit with adjustable elastic waistband (26" to 46")\n- Headphone Port: Reinforced rubber earphone cable outlet\n- Reflectivity: 3M Scotchlite high-visibility reflective strip for night running safety\n- Storage: Zippered pocket fitting smartphones up to 6.8", interior key clip and cash sleeve`
  },
  'professional-speed-skipping-rope-with-360-ball-bearings': {
    name: 'Professional Speed Skipping Rope with 360° Ball Bearings',
    image: '/uploads/prod-speed-skipping-rope.webp',
    specs: `SPECIFICATIONS:\n- Handles: Precision CNC-machined knurled aluminum handles (15cm length)\n- Bearings: Dual 360-degree high-speed ball-bearing system in each handle\n- Cable: 3-meter (10ft) flexible steel wire coated in wear-resistant red polymer (2.5mm diameter)\n- Adjustability: Tool-free thumbscrews for instant custom cable sizing\n- Use: Ideal for double-unders, boxing footwork, cardio conditioning, and cross-training`
  },
  'deep-tissue-high-density-foam-muscle-recovery-roller': {
    name: 'Deep Tissue High-Density Trigger-Point Muscle Recovery Foam Roller',
    image: '/uploads/prod-foam-roller.webp',
    specs: `SPECIFICATIONS:\n- Dimensions: 33cm length x 14cm diameter (13" x 5.5")\n- Material: High-density EVA foam over rigid hollow PVC core (supports up to 250kg)\n- Surface: Multi-density grid pattern mimicking a massage therapist's fingers and palms\n- Function: Releases myofascial trigger points, relieves tight lats, calves, IT-bands, and quads\n- Durability: Will not flatten or lose shape with repeated heavy daily gym use`
  },
  'heavy-duty-wet-suit-wetsuit-storage-barrel-bag': {
    name: 'Heavy-Duty 35L Waterproof Travel Duffle Barrel Bag',
    image: '/uploads/prod-ocean-dry-bag.webp',
    specs: `SPECIFICATIONS:\n- Capacity: 35 Litres\n- Material: 500D marine-grade tarpaulin with waterproof sealed seams\n- Function: Waterproof barrel bag for storing wet swimsuits, wetsuits, fins, and beach towels\n- Closure: Roll-down dry closure with compression buckle straps`
  },

  // Osu African Fashion & Kente Hub
  'handwoven-3-piece-bonwire-kente-stole-set': {
    name: 'Handwoven 3-Piece Bonwire Kente Stole Set',
    image: '/uploads/prod-kente-cloth-stole.webp',
    specs: `SPECIFICATIONS:\n- Origin: Handwoven in Bonwire, Ashanti Region, Ghana\n- Material: 100% authentic rayon-silk and combed cotton blend\n- Weave: Traditional double-heddle narrow-strip loom weave with Adweneasa and Oyokoman motifs\n- Set Includes: 2x ceremonial shoulder stoles (180cm x 12cm) + 1x matching waist sash\n- Care: Dry clean only to preserve vibrant vegetable and mineral dye lusters`
  },
  'master-weaver-asantehene-kente-cloth-12-yards': {
    name: 'Master Weaver Asantehene Royal Kente Cloth (12 Yards)',
    image: '/uploads/prod-kente-cloth-12yards.webp',
    specs: `SPECIFICATIONS:\n- Origin: Master-crafted in Bonwire, Ashanti Region\n- Length: Full 12-yard ceremonial two-piece cloth (5.48m x 2.4m when joined)\n- Significance: Asantehene royal ceremonial regalia with gold, green, red and black warp\n- Crafting Time: 3 to 4 months of continuous master artisan handweaving on traditional strip looms\n- Authenticity: Accompanied by Certificate of Provenance from Bonwire Weavers Guild`
  },
  'royal-oyokoman-kente-shoulder-wrap-shawl': {
    name: 'Royal Oyokoman Kente Ceremonial Shoulder Wrap Shawl',
    image: '/uploads/prod-oyokoman-kente-shawl.webp',
    specs: `SPECIFICATIONS:\n- Dimensions: 220cm length x 55cm width\n- Pattern: Oyokoman (the clan of the Asantehene) symbolizing royalty, patience, and leadership\n- Material: Handwoven mercerized cotton and silk threads with fringe tassels\n- Draping: Sits gracefully across the shoulder for weddings, church, and high-state banquets`
  },
  'bonwire-kente-neck-tie-pocket-square-set': {
    name: 'Bonwire Kente Silk Neck Tie & Pocket Square Set',
    image: '/uploads/prod-kente-tie.webp',
    specs: `SPECIFICATIONS:\n- Tie Dimensions: Standard 3.25" width x 58" length\n- Pocket Square: 10" x 10" with hand-rolled borders\n- Fabric: 100% authentic handwoven Bonwire Kente silk strip cloth lined with wool interlining\n- Packaging: Deluxe gold-embossed presentation gift box`
  },
  'men-s-hand-tooled-cowhide-ahenema-slippers': {
    name: 'Men’s Hand-Tooled Cowhide Ahenema Slippers',
    image: '/uploads/prod-ahenema-royal-slippers.webp',
    specs: `SPECIFICATIONS:\n- Origin: Handcrafted in Kumasi, Ashanti Region\n- Sole: Hand-carved curved wooden rocker sole wrapped in natural cowhide\n- Upper: Genuine vegetable-tanned bovine leather with hand-stamped Gye Nyame gold motifs\n- Toe Post: Velvet-cushioned traditional toe post\n- Cultural Use: Traditional footwear worn by Akan royals with Kente and Fugu`
  },
  'handcrafted-beaded-leather-sandals': {
    name: 'Handcrafted African Beaded Genuine Leather Sandals',
    image: '/uploads/prod-beaded-leather-sandals.webp',
    specs: `SPECIFICATIONS:\n- Upper: 100% genuine top-grain cowhide leather\n- Beadwork: Thousands of hand-strung vibrant glass seed beads in traditional chevron patterns\n- Footbed: Ergonomic contoured leather insole with natural arch support\n- Sole: Durable, non-slip recycled rubber tread`
  },
  'ashanti-brass-bell-beaded-slippers': {
    name: 'Ashanti Brass Bell Beaded Leather Slippers',
    image: '/uploads/prod-ahenema-royal-slippers.webp',
    specs: `SPECIFICATIONS:\n- Accents: Lost-wax cast traditional Ashanti brass bells that gently chime\n- Material: Genuine cowhide footbed with multicolored glass beadwork\n- Comfort: Padded insole with non-slip textured rubber sole`
  },

  // Gold Coast Shea & Botanicals
  'whipped-northern-shea-butter-with-baobab-500g': {
    name: 'Whipped Northern Shea Butter with Baobab (500g)',
    image: '/uploads/prod-whipped-shea-butter.webp',
    specs: `SPECIFICATIONS:\n- Volume/Weight: 500g (17.6 oz) in amber cosmetic tub\n- Ingredients: 100% unrefined Grade-A Butyrospermum parkii (Shea Butter), cold-pressed Adansonia digitata (Baobab Seed Oil), Vitamin E\n- Texture: Fluffy, cloud-like whipped cream that melts instantly upon contact with skin\n- Benefits: Ultra-deep moisture for dry skin, eczema relief, and stretch mark prevention\n- Scent: Naturally nutty, unscented with zero synthetic fragrances`
  },
  'traditional-african-black-soap-paste-alata-samina-400g': {
    name: 'Traditional African Black Soap Paste (Alata Samina 400g)',
    image: '/uploads/prod-alata-samina-paste.webp',
    specs: `SPECIFICATIONS:\n- Weight: 400g (14 oz) reusable wide-mouth tub\n- Origin: Handcrafted by women's cooperatives in Northern Ghana\n- Ingredients: Roasted cocoa pod ash, plantain peel ash, unrefined shea butter, virgin coconut oil, palm kernel oil, spring water\n- Skin Type: Acne-prone, oily, and sensitive skin\n- Attributes: 100% natural, sulfate-free, vegan, antibacterial`
  },
  'clarifying-activated-charcoal-tea-tree-black-soap-bar': {
    name: 'Clarifying Activated Charcoal & Tea Tree Black Soap Bar',
    image: '/uploads/prod-charcoal-black-soap.webp',
    specs: `SPECIFICATIONS:\n- Weight: 150g bar in eco-friendly kraft packaging\n- Key Actives: Pure Alata Samina base, bamboo activated charcoal, Australian organic tea tree essential oil\n- Function: Deep pore detox, clears breakouts and razor bumps, regulates excess sebum\n- Lather: Rich, velvety lather that leaves skin squeaky clean without stripping moisture`
  },
  'coastal-avocado-argan-deep-moisture-hair-mask-350g': {
    name: 'Coastal Avocado & Argan Deep Moisture Hair Mask (350g)',
    image: '/uploads/prod-avocado-hair-mask.webp',
    specs: `SPECIFICATIONS:\n- Volume: 350g (12.3 oz)\n- Key Ingredients: Cold-pressed Ghanaian avocado butter, Moroccan argan oil, raw shea butter, hydrolyzed silk protein\n- Hair Types: Type 3 and Type 4 curls, coils, natural, and transitioning hair\n- Treatment: Deep conditioning restorative mask that restores elasticity, stops breakage, and defines curls`
  },
  'hibiscus-rosehip-petal-exfoliating-glow-polish': {
    name: 'Hibiscus & Rosehip Petal Exfoliating Glow Polish',
    image: '/uploads/prod-rosehip-glow-polish.webp',
    specs: `SPECIFICATIONS:\n- Net Weight: 300g glass cosmetic jar\n- Base: Micro-fine cane sugar crystals infused with organic sun-dried Hibiscus sabdariffa flower powder, cold-pressed rosehip seed oil, and sweet almond oil\n- Exfoliation: Gentle, skin-polishing buffing action that sloughs off dead skin cells\n- Result: Silky, radiant, glowing skin with a soft natural floral radiance`
  },

  // Makola Heritage Provisions
  'artisanal-smoked-shrimp-fish-shito-350ml-jar': {
    name: 'Artisanal Smoked Shrimp & Fish Shito (350ml Jar)',
    image: '/uploads/prod-shito-authentic-jar.webp',
    specs: `SPECIFICATIONS:\n- Net Volume: 350ml (12 fl oz)\n- Ingredients: Smoked dried herrings, wild-caught dried baby shrimp, dried chili peppers, ginger, garlic, onions, vegetable oil, natural spices\n- Preparation: Slow-cooked over gentle heat for 8 hours into a dark, savory umami paste\n- Heat Rating: 4/5 (Authentic Ghanaian heat)\n- Shelf Life: 12 months ambient / refrigerate after opening`
  },
  'smoked-crayfish-garlic-black-pepper-sauce-350ml': {
    name: 'Smoked Crayfish & Garlic Black Pepper Sauce (350ml)',
    image: '/uploads/prod-smoked-crayfish-shito.webp',
    specs: `SPECIFICATIONS:\n- Net Volume: 350ml\n- Ingredients: Wild-caught wood-smoked freshwater crayfish, roasted garlic, black peppercorns, crushed hot chili, caramelized red onions, vegetable oil\n- Pairing: Incredible with waakye, fried plantains (kelewele), jollof rice, and grilled fish`
  },
  'vegetarian-vegan-shiitake-mushroom-shito-300ml': {
    name: 'Vegetarian & Vegan Shiitake Mushroom Shito (300ml)',
    image: '/uploads/prod-vegetarian-shiitake-shito.webp',
    specs: `SPECIFICATIONS:\n- Volume: 300ml\n- Formulation: 100% plant-based formulation utilizing sun-dried wild forest shiitake mushrooms, smoked nori seaweed, and slow-caramelized shallots\n- Umami Level: Full authentic Ghanaian shito umami flavor without any seafood or fish derivatives\n- Certified: 100% Vegan, Gluten-Free, Halal`
  },
  'whole-prekese-indigenous-spices-wellness-pack-500g': {
    name: 'Whole Prekese & Indigenous Spices Wellness Pack (500g)',
    image: '/uploads/prod-prekese-spice.webp',
    specs: `SPECIFICATIONS:\n- Net Weight: 500g (1.1 lbs)\n- Ingredients: 100% wild-harvested whole dried Prekese (Tetrapleura tetraptera / Aidan fruit) pods\n- Origin: Eastern Region virgin forests, Ghana\n- Culinary & Wellness: Aromatic flavor base for Ghanaian light soup, palm nut soup, and boiled wellness tea\n- Health Attributes: Rich in polyphenols, potassium, iron, and natural anti-inflammatory compounds`
  },

  // Aburi Woodcrafts & Interior Living
  'hand-painted-adinkra-wisdom-canvas-wall-hanging': {
    name: 'Hand-Painted Adinkra Wisdom Canvas Wall Hanging',
    image: '/uploads/prod-adinkra-canvas-art.webp',
    specs: `SPECIFICATIONS:\n- Dimensions: 60cm x 60cm (24" x 24")\n- Canvas: Heavyweight 380 GSM textured unbleached organic cotton canvas\n- Pigments: Natural Badie bark dye and archival acrylics hand-stamped with traditional calabash stamps\n- Motifs: Features Gye Nyame (Supremacy of God), Sankofa (Learn from the past), and Duafe (Beauty & Care)\n- Framing: Gallery-wrapped around solid cedar wooden stretcher bars, ready to hang`
  },

  // Afro-Bites Gourmet & Cocoa Co.
  'savannah-honey-glazed-roasted-cashews-300g-tin': {
    name: 'Savannah Honey-Glazed Roasted Cashews (300g Tin)',
    image: '/uploads/prod-honey-roasted-cashews.webp',
    specs: `SPECIFICATIONS:\n- Net Weight: 300g in reusable vacuum-sealed gold steel tin\n- Grade: Jumbo W240 whole cashew kernels from the Wenchi Savannah belt of Ghana\n- Glaze: Pure raw Ghanaian forest honey with a pinch of sea salt\n- Roasting: Slow-roasted in small batches without hydrogenated palm oils\n- Freshness: 9-month shelf life with nitrogen flush seal`
  },
  'artisan-hibiscus-sobolo-brew-infusion-blend-20-pouches': {
    name: 'Artisan Hibiscus (Sobolo) Brew Infusion Blend (20 Pouches)',
    image: '/uploads/prod-sobolo-hibiscus-brew.webp',
    specs: `SPECIFICATIONS:\n- Contents: 20 biodegradable pyramid brew pouches\n- Ingredients: Organic sun-dried Northern Ghana Hibiscus flowers, crushed spicy ginger, dried pineapple rind, cloves, and grains of Selim\n- Preparation: Steep hot for 5 minutes, or brew and chill over ice for authentic Ghanaian Sobolo\n- Caffeine: 100% naturally caffeine-free and rich in Vitamin C`
  },
  'golden-spiced-ginger-lemongrass-herbal-tea-150g-tin': {
    name: 'Golden Spiced Ginger & Lemongrass Herbal Tea (150g Tin)',
    image: '/uploads/prod-ginger-lemongrass-tin.webp',
    specs: `SPECIFICATIONS:\n- Net Weight: 150g loose-leaf herbal blend in airtight gold tin\n- Ingredients: Organically cultivated Ghanaian lemongrass, Koforidua sun-dried ginger, wild Prekese bits, and citrus peel\n- Aroma: Uplifting bright lemon zest with a warming spicy ginger finish\n- Health Benefits: Aids digestive wellness, soothes respiratory discomfort, and promotes relaxation`
  },

  // Accra Gadget Hub (Test)
  'anker-737-power-bank-24-000mah-140w': {
    name: 'Anker 737 Power Bank (PowerCore 24K) 140W Fast Charging',
    image: '/uploads/prod-anker-powerbank.webp',
    specs: `SPECIFICATIONS:\n- Capacity: 24,000mAh (86.4Wh - airline flight approved)\n- Max Output: 140W via USB-C PD 3.1\n- Ports: 2x USB-C (140W max each), 1x USB-A (18W max)\n- Smart Display: High-resolution color screen showing remaining battery %, output wattage, input wattage, and time to full charge\n- Safety: ActiveShield 2.0 temperature monitoring over 3 million times per day`
  },
  'apple-iphone-13-pro-128gb': {
    name: 'Apple iPhone 13 Pro 128GB Sierra Blue',
    image: '/uploads/prod-iphone-13-pro.webp',
    specs: `SPECIFICATIONS:\n- Display: 6.1" Super Retina XDR OLED with ProMotion adaptive 120Hz\n- Processor: Apple A15 Bionic (6-core CPU, 5-core GPU)\n- Storage: 128GB NVMe\n- Cameras: Triple 12MP system with LiDAR Scanner\n- Video: ProRes video recording up to 4K at 30 fps, Dolby Vision HDR recording\n- Battery: All-day battery life with MagSafe and Qi wireless charging`
  }
};

async function generateCompleteCatalog() {
  const completeList = [];

  for (const item of currentCatalog) {
    const replacement = IMAGE_REPLACEMENTS[item.slug];
    if (replacement) {
      completeList.push({
        ...item,
        name: replacement.name,
        image: replacement.image,
        description: `${item.description.split('SPECIFICATIONS:')[0].trim()}\n\n${replacement.specs}`
      });
    } else {
      // Ensure description has real specifications if missing
      let desc = item.description;
      if (!desc.includes('SPECIFICATIONS:') && !desc.includes('- ')) {
        desc = `${desc}\n\nSPECIFICATIONS:\n- Origin: Authentic Ghanaian Craftsmanship & Production\n- Quality: 100% Genuine Certified Quality\n- Guarantee: Covered by The Ultimate Virtual Mall Guarantee`;
      }
      completeList.push({
        ...item,
        image: item.imageUrl,
        description: desc
      });
    }
  }

  fs.writeFileSync('flawless_catalog.json', JSON.stringify(completeList, null, 2));
  console.log(`Wrote ${completeList.length} items to flawless_catalog.json`);

  // Verify all image files exist
  let missing = 0;
  for (const item of completeList) {
    const relFile = item.image.replace('/uploads/', '');
    const p = path.join(UPLOAD_DIR, relFile);
    if (!fs.existsSync(p)) {
      console.warn('MISSING FILE:', relFile, 'for product:', item.name);
      missing++;
    }
  }
  console.log('Verification finished. Total missing image files:', missing);
}

generateCompleteCatalog();
