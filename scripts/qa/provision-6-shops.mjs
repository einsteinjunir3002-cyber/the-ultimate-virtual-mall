import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient, ShopStatus, ProductStatus, TemplateStyle } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public' } }
});

const supabasePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres' } }
});

const UPLOAD_DIR = path.resolve('public/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function downloadOrCacheImage(sourceUrl, fallbackPrefix = 'asset') {
  const hash = crypto.createHash('md5').update(sourceUrl).digest('hex').slice(0, 8);
  const existing = fs.readdirSync(UPLOAD_DIR).find(f => f.includes(hash));
  if (existing) {
    return `/uploads/${existing}`;
  }

  try {
    const res = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = sourceUrl.endsWith('.jpg') || sourceUrl.endsWith('.jpeg') ? 'jpg' : 'webp';
      const filename = `img-${Date.now()}-${hash}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
      return `/uploads/${filename}`;
    }
  } catch (e) {
    console.warn(`Could not fetch ${sourceUrl}, using fallback`);
  }

  // Fallback to one of existing verified uploaded images
  const existingFiles = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith('img-'));
  const random = existingFiles[Math.floor(Math.random() * existingFiles.length)];
  return `/uploads/${random}`;
}

const SHOPS_DATA = [
  {
    name: 'Osu African Fashion & Kente Hub',
    slug: 'osu-fashion-kente-hub',
    tagline: 'Handwoven Bonwire Kente, Batakari & Modern African Wear',
    description: 'Accra’s premier boutique for authentic Ghanaian traditional textiles, modern bespoke African prints, and ceremonial Kente cloth directly from Bonwire master weavers.',
    businessCategory: 'Fashion & Apparel',
    mallCategorySlug: 'fashion',
    location: 'Oxford Street, Osu, Accra',
    phone: '+233244111222',
    whatsappNumber: '+233244111222',
    email: 'seller.fashion@example.com',
    themeColor: '#7c3aed',
    templateStyle: TemplateStyle.LUXURY_BOUTIQUE,
    baseDeliveryFee: 25.00,
    deliveryPolicy: 'Same-day express delivery within Greater Accra. Nationwide delivery via VIP Transport or DHL in 2-3 working days.',
    returnPolicy: 'Custom tailored items are non-refundable. Standard stoles and unworn apparel can be exchanged within 7 days in original condition.',
    categories: ['Bonwire Kente', 'Traditional Smocks (Batakari)', 'GTP Wax Prints', 'Beaded Footwear'],
    products: [
      {
        name: 'Handwoven 3-Piece Bonwire Kente Stole Set',
        slug: 'bonwire-kente-stole-set-ghana',
        description: 'Authentic 3-piece handwoven Bonwire Kente ceremonial stole set with gold, royal blue, and maroon geometric patterns. Hand-crafted by master weavers in the Ashanti Region.',
        price: 1850.00,
        salePrice: 1650.00,
        brand: 'Bonwire Master Crafts',
        stock: 12,
        categoryName: 'Bonwire Kente',
        sourceImg: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
        variants: [
          { name: 'Gold & Maroon', price: 1650.00, stock: 6, sku: 'KNT-GM-01' },
          { name: 'Royal Blue & Gold', price: 1750.00, stock: 6, sku: 'KNT-BG-02' }
        ]
      },
      {
        name: 'Northern Ghana Traditional Smock (Fugu / Batakari)',
        slug: 'northern-ghana-traditional-smock-fugu',
        description: 'Heavyweight handwoven cotton smock originating from the Upper East and Northern regions of Ghana. Embroidered collar with sturdy double-stitched durability.',
        price: 650.00,
        salePrice: null,
        brand: 'Tamale Heritage Weaves',
        stock: 18,
        categoryName: 'Traditional Smocks (Batakari)',
        sourceImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
        variants: [
          { name: 'Size Medium (Chest 40")', price: 650.00, stock: 6, sku: 'FUGU-M' },
          { name: 'Size Large (Chest 44")', price: 650.00, stock: 7, sku: 'FUGU-L' },
          { name: 'Size XL (Chest 48")', price: 680.00, stock: 5, sku: 'FUGU-XL' }
        ]
      },
      {
        name: 'Handcrafted Beaded Leather Sandals',
        slug: 'handcrafted-beaded-leather-sandals',
        description: 'Genuine cowhide leather slippers decorated with vibrant Ghanaian glass beads. Cushioned insole for all-day comfort under the tropical sun.',
        price: 280.00,
        salePrice: 250.00,
        brand: 'Osu Artisan Leather',
        stock: 25,
        categoryName: 'Beaded Footwear',
        sourceImg: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
        variants: [
          { name: 'Size 41 EU', price: 250.00, stock: 8, sku: 'SND-41' },
          { name: 'Size 42 EU', price: 250.00, stock: 10, sku: 'SND-42' },
          { name: 'Size 43 EU', price: 250.00, stock: 7, sku: 'SND-43' }
        ]
      },
      {
        name: 'African Print Infinity Dress (GTP Wax)',
        slug: 'african-print-infinity-dress-gtp',
        description: 'Versatile multi-way wrap maxi dress tailored from authentic GTP Ghanaian wax print cotton. Can be styled in over 15 unique necklines and silhouettes.',
        price: 420.00,
        salePrice: null,
        brand: 'Osu Bespoke',
        stock: 15,
        categoryName: 'GTP Wax Prints',
        sourceImg: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
        variants: [
          { name: 'Sunset Orange Pattern', price: 420.00, stock: 8, sku: 'INF-ORG' },
          { name: 'Teal Peacock Pattern', price: 420.00, stock: 7, sku: 'INF-TEL' }
        ]
      }
    ]
  },
  {
    name: 'Gold Coast Shea & Botanicals',
    slug: 'gold-coast-shea-sanctuary',
    tagline: '100% Raw Unrefined Northern Shea Butter & Organic Skincare',
    description: 'Ethically sourced raw shea butter from women’s cooperatives in Tamale, blended with baobab oil, cocoa butter, and cold-pressed coconut oil for radiant African skin and hair.',
    businessCategory: 'Beauty & Cosmetics',
    mallCategorySlug: 'beauty',
    location: 'East Legon, Accra',
    phone: '+233201222333',
    whatsappNumber: '+233201222333',
    email: 'seller.beauty@example.com',
    themeColor: '#059669',
    templateStyle: TemplateStyle.WARM_ARTISAN,
    baseDeliveryFee: 20.00,
    deliveryPolicy: 'Dispatched within 24 hours across Accra. Express temperature-safe packaging to prevent melting in transit.',
    returnPolicy: 'For hygiene and safety reasons, opened skincare cosmetics are non-returnable. Unopened jars can be returned within 14 days.',
    categories: ['Raw Shea Butter', 'African Black Soap', 'Hair Elixirs', 'Lip & Body Scrubs'],
    products: [
      {
        name: 'Whipped Northern Shea Butter with Baobab (500g)',
        slug: 'whipped-northern-shea-butter-baobab',
        description: 'Velvety whipped Grade-A unrefined shea butter enriched with antioxidant baobab oil and calming lavender. Deeply hydrates dry skin and locks in hair moisture.',
        price: 120.00,
        salePrice: 105.00,
        brand: 'Gold Coast Botanicals',
        stock: 40,
        categoryName: 'Raw Shea Butter',
        sourceImg: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80',
        variants: [
          { name: 'Vanilla & Lavender Scented', price: 105.00, stock: 20, sku: 'SHEA-VL' },
          { name: 'Unscented Pure Natural', price: 105.00, stock: 20, sku: 'SHEA-NAT' }
        ]
      },
      {
        name: 'Traditional African Black Soap Paste (Alata Samina 400g)',
        slug: 'traditional-african-black-soap-alata-samina',
        description: 'Authentic Alata Samina formulated with plantain skin ash, cocoa pod ash, and pure palm kernel oil. Clears blemishes, fades spots, and clarifies pores gently.',
        price: 65.00,
        salePrice: null,
        brand: 'Gold Coast Botanicals',
        stock: 50,
        categoryName: 'African Black Soap',
        sourceImg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
        variants: []
      },
      {
        name: 'Cold-Pressed Virgin Coconut & Hibiscus Hair Elixir (250ml)',
        slug: 'coconut-hibiscus-hair-elixir-ghana',
        description: 'Nutrient-rich hair treatment oil pressed from coastal Ghanaian coconuts infused with hibiscus petals. Stimulates hair follicle growth and seals split ends.',
        price: 95.00,
        salePrice: 85.00,
        brand: 'Gold Coast Botanicals',
        stock: 35,
        categoryName: 'Hair Elixirs',
        sourceImg: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80',
        variants: []
      },
      {
        name: 'Pure Cocoa Butter Lip Balm & Organic Sugar Scrub Set',
        slug: 'cocoa-butter-lip-balm-sugar-scrub-set',
        description: 'Dual care lip renewal duo featuring raw Ghanaian cocoa butter and golden cane sugar scrub. Leaves lips soft, supple, and moisturized all day.',
        price: 55.00,
        salePrice: null,
        brand: 'Gold Coast Botanicals',
        stock: 60,
        categoryName: 'Lip & Body Scrubs',
        sourceImg: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
        variants: []
      }
    ]
  },
  {
    name: 'Makola Heritage Provisions',
    slug: 'makola-heritage-provisions',
    tagline: 'Authentic Ghanaian Spices, Shito & Kitchen Essentials',
    description: 'Bringing the culinary richness of Makola Market directly to your home. Premium artisanal Shito, sun-dried traditional spices, organic gari, and heritage Ghanaian pantry essentials.',
    businessCategory: 'Groceries & Essentials',
    mallCategorySlug: 'groceries',
    location: 'Makola Shopping Mall, Central Business District, Accra',
    phone: '+233501333444',
    whatsappNumber: '+233501333444',
    email: 'seller.groceries@example.com',
    themeColor: '#dc2626',
    templateStyle: TemplateStyle.MARKETPLACE_GRID,
    baseDeliveryFee: 15.00,
    deliveryPolicy: 'Same-day courier within Accra Metropolitan area. All glass jars safely bubble-wrapped in heavy-duty food crates.',
    returnPolicy: 'Perishable pantry items and opened food products cannot be returned. Damaged or leaking items replaced immediately upon proof of delivery photo.',
    categories: ['Artisan Shito', 'Heritage Spices', 'Grains & Flours', 'Traditional Teas'],
    products: [
      {
        name: 'Artisanal Smoked Shrimp & Fish Shito (350ml Jar)',
        slug: 'artisanal-smoked-shrimp-fish-shito-jar',
        description: 'Slow-simmered Ghanaian black pepper sauce made with real smoked dried herrings, river shrimp, ginger, garlic, and hot bonnet peppers. Rich, savory, and aromatic.',
        price: 75.00,
        salePrice: 65.00,
        brand: 'Makola Kitchen Co.',
        stock: 45,
        categoryName: 'Artisan Shito',
        sourceImg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
        variants: [
          { name: 'Mild & Flavorful', price: 65.00, stock: 20, sku: 'SHT-MLD' },
          { name: 'Hot & Spicy (Traditional Heat)', price: 65.00, stock: 25, sku: 'SHT-HOT' }
        ]
      },
      {
        name: 'Whole Prekese & Indigenous Spices Wellness Pack (500g)',
        slug: 'whole-prekese-indigenous-spices-pack',
        description: 'Sun-dried aromatic Aidan fruit (Prekese), African nutmeg (Calabash), and alligator pepper pods. Perfect for light soups, palm nut soup, and traditional detox brews.',
        price: 45.00,
        salePrice: null,
        brand: 'Makola Kitchen Co.',
        stock: 30,
        categoryName: 'Heritage Spices',
        sourceImg: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80',
        variants: []
      },
      {
        name: 'Crispy Yellow Gari Soakings Special (2kg Sack)',
        slug: 'crispy-yellow-gari-soakings-2kg',
        description: 'Premium fermented cassava granules fried to golden perfection with palm oil. Super crispy, sand-free, and ideal for ice-water soakings with groundnuts and milk.',
        price: 50.00,
        salePrice: null,
        brand: 'Volta Gold Farms',
        stock: 50,
        categoryName: 'Grains & Flours',
        sourceImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
        variants: []
      },
      {
        name: 'Organic Sun-Dried Dawadawa & Locust Beans Paste',
        slug: 'organic-sun-dried-dawadawa-locust-paste',
        description: 'Fermented African locust bean seasoning packed with umami. The secret natural bouillon ingredient behind rich Ghanaian soups, stews, and jollof rice.',
        price: 40.00,
        salePrice: 35.00,
        brand: 'Makola Kitchen Co.',
        stock: 40,
        categoryName: 'Heritage Spices',
        sourceImg: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
        variants: []
      }
    ]
  },
  {
    name: 'Aburi Woodcrafts & Interior Living',
    slug: 'aburi-woodcrafts-living',
    tagline: 'Hand-Carved Ashanti Stools, Adinkra Decor & Furniture',
    description: 'Sculpted by generational woodcarvers in the Aburi hills using sustainable mahogany and cedar wood. Infuse traditional Ghanaian royalty and elegance into your modern living space.',
    businessCategory: 'Home & Furniture',
    mallCategorySlug: 'home-furniture',
    location: 'Aburi Craft Ridge / Dzorwulu Showroom, Accra',
    phone: '+233245444555',
    whatsappNumber: '+233245444555',
    email: 'seller.woodcraft@example.com',
    themeColor: '#78350f',
    templateStyle: TemplateStyle.WARM_ARTISAN,
    baseDeliveryFee: 60.00,
    deliveryPolicy: 'Specialized furniture van delivery with white-glove unboxing in Greater Accra. Secure crate packaging for regional and export deliveries.',
    returnPolicy: 'Woodcraft furniture carries a 1-year termite and craftsmanship warranty. Returns accepted within 7 days with original delivery receipt.',
    categories: ['Royal Stools', 'Adinkra Clocks & Wall Art', 'Bolga Baskets', 'Kitchen Woodenware'],
    products: [
      {
        name: 'Hand-Carved Royal Ashanti Gye Nyame Stool (Solid Mahogany)',
        slug: 'royal-ashanti-gye-nyame-stool-solid-mahogany',
        description: 'Carved from a single trunk of seasoned Ghanaian mahogany. Features the iconic Gye Nyame central pillar symbolizing the supremacy of God. Natural beeswax polish.',
        price: 1450.00,
        salePrice: 1350.00,
        brand: 'Aburi Master Carvers',
        stock: 8,
        categoryName: 'Royal Stools',
        sourceImg: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
        variants: [
          { name: 'Polished Natural Mahogany', price: 1350.00, stock: 4, sku: 'STL-MAH' },
          { name: 'Smoked Antique Dark Walnut', price: 1350.00, stock: 4, sku: 'STL-WAL' }
        ]
      },
      {
        name: 'Adinkra Symbols Wall Clock (14-Inch Brass & Cedar)',
        slug: 'adinkra-symbols-wall-clock-brass-wood',
        description: 'Silent sweep quartz movement wall clock bordered by carved Ghanaian Adinkra symbols representing wisdom, unity, and strength. Brass numerals and cedar body.',
        price: 380.00,
        salePrice: null,
        brand: 'Aburi Crafts Co.',
        stock: 16,
        categoryName: 'Adinkra Clocks & Wall Art',
        sourceImg: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80',
        variants: []
      },
      {
        name: 'Bolgatanga Hand-Woven Elephant Grass Laundry Basket',
        slug: 'bolgatanga-woven-elephant-grass-laundry-basket',
        description: 'Authentic Bolga storage hamper hand-woven with durable veta vera grass and finished with reinforced goat leather carrying handles. Eco-friendly and washable.',
        price: 320.00,
        salePrice: 290.00,
        brand: 'Bolga Weavers Guild',
        stock: 22,
        categoryName: 'Bolga Baskets',
        sourceImg: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80',
        variants: [
          { name: 'Natural Straw & Black Leather', price: 290.00, stock: 12, sku: 'BLG-NAT' },
          { name: 'Tri-Color Vibrant Weave', price: 290.00, stock: 10, sku: 'BLG-TRI' }
        ]
      },
      {
        name: 'Carved African Ebony Wood Salad Serving Spoons Set',
        slug: 'carved-ebony-wood-salad-spoons-set',
        description: 'Set of two hand-carved African hardwood serving utensils. Finished with food-grade coconut oil. Sculpted with traditional animal silhouettes on the handle.',
        price: 160.00,
        salePrice: null,
        brand: 'Aburi Crafts Co.',
        stock: 30,
        categoryName: 'Kitchen Woodenware',
        sourceImg: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80',
        variants: []
      }
    ]
  },
  {
    name: 'Afro-Bites Gourmet & Cocoa Co.',
    slug: 'afro-bites-gourmet-treats',
    tagline: 'Ghanaian Single-Origin Chocolates, Roasted Cashews & Beverages',
    description: 'Celebrating the world’s finest Ghanaian cocoa and savannah harvests with gourmet artisan dark chocolate bars, roasted honey cashews, and refreshing dried tropical fruits.',
    businessCategory: 'Food & Beverages',
    mallCategorySlug: 'food-beverages',
    location: 'Cantonments / Airport Residential, Accra',
    phone: '+233271555666',
    whatsappNumber: '+233271555666',
    email: 'seller.gourmet@example.com',
    themeColor: '#451a03',
    templateStyle: TemplateStyle.MODERN_MINIMAL,
    baseDeliveryFee: 20.00,
    deliveryPolicy: 'Temperature-controlled delivery bags ensure chocolates never melt in Accra transit. Same-day delivery for orders placed before 3 PM.',
    returnPolicy: 'Food and confectionery goods are final sale. Replacement or full refund issued for any order that arrives damaged or spoiled.',
    categories: ['Single-Origin Chocolates', 'Savannah Cashews', 'Dried Fruits', 'Botanical Teas'],
    products: [
      {
        name: 'Single-Origin 72% Dark Cocoa Chocolate Bar Gift Box (4 x 80g)',
        slug: 'single-origin-72-dark-cocoa-chocolate-gift-box',
        description: 'Tasting flights of pure Ghanaian cocoa beans from the Western Region. Includes 72% pure dark, sea salt nibs, orange zest, and chili ginger infused bars.',
        price: 180.00,
        salePrice: 160.00,
        brand: 'Afro-Bites Chocolatiers',
        stock: 35,
        categoryName: 'Single-Origin Chocolates',
        sourceImg: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80',
        variants: []
      },
      {
        name: 'Savannah Honey-Glazed Roasted Cashews (300g Tin)',
        slug: 'savannah-honey-glazed-roasted-cashews-tin',
        description: 'Plump Northern Ghana whole cashew nuts roasted in small batches with wild honey and sea salt. Crunchy, nutrient-dense, and irresistible.',
        price: 95.00,
        salePrice: 85.00,
        brand: 'Savannah Crunch Co.',
        stock: 45,
        categoryName: 'Savannah Cashews',
        sourceImg: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80',
        variants: [
          { name: 'Honey-Glazed Salted', price: 85.00, stock: 25, sku: 'CSH-HNY' },
          { name: 'Black Pepper & Chili', price: 85.00, stock: 20, sku: 'CSH-PEP' }
        ]
      },
      {
        name: 'Sun-Dried Organic Volta Mango Strips (200g Pack)',
        slug: 'sun-dried-organic-volta-mango-strips',
        description: '100% natural Brooks mango slices sun-dried without added sugar, preservatives, or artificial colors. Naturally sweet and chewy goodness from the Volta Basin.',
        price: 45.00,
        salePrice: null,
        brand: 'Volta Sunshine Foods',
        stock: 50,
        categoryName: 'Dried Fruits',
        sourceImg: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80',
        variants: []
      },
      {
        name: 'Artisan Hibiscus (Sobolo) Brew Infusion Blend (20 Pouches)',
        slug: 'artisan-hibiscus-sobolo-brew-tea-pouches',
        description: 'Handcrafted blend of sun-dried organic roselle calyces (Sobolo flowers), dried pineapple chunks, hot ginger root, and cloves. Brews deep ruby red.',
        price: 60.00,
        salePrice: 50.00,
        brand: 'Afro-Bites Gourmet',
        stock: 40,
        categoryName: 'Botanical Teas',
        sourceImg: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
        variants: []
      }
    ]
  },
  {
    name: 'Labadi Surf & Active Co.',
    slug: 'labadi-surf-active',
    tagline: 'Coastal Activewear, Beach Sports & Outdoor Equipment',
    description: 'Gear for athletes, runners, swimmers, and beach lovers along the Gulf of Guinea. Durable water-resistant sports accessories, gym essentials, and coastal sportswear.',
    businessCategory: 'Sports & Fitness',
    mallCategorySlug: 'sports-fitness',
    location: 'Labadi Beach Road / Trade Fair, Accra',
    phone: '+233551666777',
    whatsappNumber: '+233551666777',
    email: 'seller.surf@example.com',
    themeColor: '#0284c7',
    templateStyle: TemplateStyle.MARKETPLACE_GRID,
    baseDeliveryFee: 25.00,
    deliveryPolicy: 'Fast motorcycle courier delivery across Accra beaches and sports gyms within 3 hours. Free in-person pickup at our Labadi beach shop.',
    returnPolicy: 'Sports gear and accessories can be returned within 14 days in unused condition with tags attached. Swimwear must have hygiene liner intact.',
    categories: ['Coastal Activewear', 'Dry Bags & Storage', 'Hydration Bottles', 'Fitness Accessories'],
    products: [
      {
        name: 'Ghana Black Stars Coastal Athletic Rash Guard (SPF 50+)',
        slug: 'ghana-black-stars-coastal-athletic-rash-guard',
        description: 'High-performance 4-way stretch quick-dry rash guard with UV SPF 50+ sun protection. Styled in Ghanaian national colors with anti-chafing flatlock seams.',
        price: 340.00,
        salePrice: 295.00,
        brand: 'Labadi Active',
        stock: 25,
        categoryName: 'Coastal Activewear',
        sourceImg: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
        variants: [
          { name: 'Medium (Chest 38-40")', price: 295.00, stock: 8, sku: 'RSH-M' },
          { name: 'Large (Chest 42-44")', price: 295.00, stock: 10, sku: 'RSH-L' },
          { name: 'XL (Chest 46-48")', price: 295.00, stock: 7, sku: 'RSH-XL' }
        ]
      },
      {
        name: 'Heavy-Duty 20L Waterproof Ocean Dry Bag',
        slug: 'heavy-duty-20l-waterproof-ocean-dry-bag',
        description: 'Tear-resistant PVC tarpaulin roll-top sack that keeps phones, cameras, and clothes bone-dry during boat trips, surfing, or tropical downpours.',
        price: 190.00,
        salePrice: 170.00,
        brand: 'Labadi Active',
        stock: 30,
        categoryName: 'Dry Bags & Storage',
        sourceImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        variants: [
          { name: 'High-Vis Ocean Yellow', price: 170.00, stock: 15, sku: 'DRY-YEL' },
          { name: 'Tactical Matte Black', price: 170.00, stock: 15, sku: 'DRY-BLK' }
        ]
      },
      {
        name: 'Insulated Stainless Steel 1-Litre Thermal Sports Bottle',
        slug: 'insulated-stainless-steel-1-litre-sports-bottle',
        description: 'Double-walled vacuum insulated flask that keeps coconut water and drinks ice-cold for 24 hours under the tropical sun. Leakproof sports cap with handle.',
        price: 140.00,
        salePrice: 125.00,
        brand: 'Labadi Active',
        stock: 40,
        categoryName: 'Hydration Bottles',
        sourceImg: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
        variants: [
          { name: 'Ocean Wave Blue', price: 125.00, stock: 20, sku: 'BTL-BLU' },
          { name: 'Forest Palm Green', price: 125.00, stock: 20, sku: 'BTL-GRN' }
        ]
      },
      {
        name: 'Professional Speed Skipping Rope with 360° Ball Bearings',
        slug: 'professional-speed-skipping-rope-bearings',
        description: 'Adjustable steel wire jump rope with lightweight aluminum knurled handles and smooth 360-degree ball bearings. Ideal for boxing and cardio workouts.',
        price: 85.00,
        salePrice: null,
        brand: 'Labadi Active',
        stock: 35,
        categoryName: 'Fitness Accessories',
        sourceImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
        variants: []
      }
    ]
  }
];

async function syncToDatabase(prisma, isSupabase = false) {
  console.log(`\n=== SYNCING TO ${isSupabase ? 'SUPABASE' : 'LOCAL'} DATABASE ===`);

  const mallCategories = await prisma.mallCategory.findMany();
  const mallCatMap = Object.fromEntries(mallCategories.map(c => [c.slug, c.id]));

  for (const shopData of SHOPS_DATA) {
    console.log(`\nProvisioning shop: ${shopData.name} (${shopData.slug})...`);

    // 1. Password hash
    const passwordHash = await bcrypt.hash('MerchantPass#2026', 10);

    // 2. Owner User
    const owner = await prisma.user.upsert({
      where: { email: shopData.email },
      update: {
        name: `${shopData.name} Owner`,
        role: 'MERCHANT',
        phone: shopData.phone,
      },
      create: {
        email: shopData.email,
        name: `${shopData.name} Owner`,
        passwordHash,
        role: 'MERCHANT',
        phone: shopData.phone,
      }
    });

    // 3. Logo and Banner
    const logoUrl = await downloadOrCacheImage(shopData.products[0].sourceImg, `${shopData.slug}-logo`);
    const bannerUrl = await downloadOrCacheImage(shopData.products[1].sourceImg, `${shopData.slug}-banner`);

    // 4. Shop
    const shop = await prisma.shop.upsert({
      where: { slug: shopData.slug },
      update: {
        name: shopData.name,
        tagline: shopData.tagline,
        description: shopData.description,
        logoUrl,
        bannerUrl,
        businessCategory: shopData.businessCategory,
        location: shopData.location,
        phone: shopData.phone,
        whatsappNumber: shopData.whatsappNumber,
        email: shopData.email,
        status: ShopStatus.ACTIVE,
        themeColor: shopData.themeColor,
        templateStyle: shopData.templateStyle,
        deliveryPolicy: shopData.deliveryPolicy,
        returnPolicy: shopData.returnPolicy,
        pickupAvailable: true,
        baseDeliveryFee: shopData.baseDeliveryFee,
        isFeatured: true,
      },
      create: {
        ownerId: owner.id,
        name: shopData.name,
        slug: shopData.slug,
        tagline: shopData.tagline,
        description: shopData.description,
        logoUrl,
        bannerUrl,
        businessCategory: shopData.businessCategory,
        location: shopData.location,
        phone: shopData.phone,
        whatsappNumber: shopData.whatsappNumber,
        email: shopData.email,
        status: ShopStatus.ACTIVE,
        themeColor: shopData.themeColor,
        templateStyle: shopData.templateStyle,
        deliveryPolicy: shopData.deliveryPolicy,
        returnPolicy: shopData.returnPolicy,
        pickupAvailable: true,
        baseDeliveryFee: shopData.baseDeliveryFee,
        isFeatured: true,
      }
    });

    // 5. Shop Categories
    const shopCatIdMap = {};
    for (let i = 0; i < shopData.categories.length; i++) {
      const catName = shopData.categories[i];
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const sc = await prisma.shopCategory.upsert({
        where: { shopId_slug: { shopId: shop.id, slug: catSlug } },
        update: { name: catName, displayOrder: i, isActive: true },
        create: {
          shopId: shop.id,
          name: catName,
          slug: catSlug,
          displayOrder: i,
          isActive: true
        }
      });
      shopCatIdMap[catName] = sc.id;
    }

    // 6. Products
    const mallCatId = mallCatMap[shopData.mallCategorySlug] || null;

    for (const p of shopData.products) {
      const productImgUrl = await downloadOrCacheImage(p.sourceImg, p.slug);
      const shopCatId = shopCatIdMap[p.categoryName] || null;

      const product = await prisma.product.upsert({
        where: { id: `prod-${shopData.slug}-${p.slug}`.slice(0, 30) },
        update: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          brand: p.brand,
          stock: p.stock,
          status: ProductStatus.PUBLISHED,
          isAvailable: true,
          mallCategoryId: mallCatId,
          shopCategoryId: shopCatId,
        },
        create: {
          id: `prod-${shopData.slug}-${p.slug}`.slice(0, 30),
          shopId: shop.id,
          mallCategoryId: mallCatId,
          shopCategoryId: shopCatId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          brand: p.brand,
          stock: p.stock,
          status: ProductStatus.PUBLISHED,
          isAvailable: true,
        }
      });

      // Product Image
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: productImgUrl,
          altText: p.name,
          displayOrder: 0,
        }
      });

      // Product Variants
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
            }
          });
        }
      }
      console.log(`  ✓ Product "${p.name}" (GH₵ ${p.price}${p.variants.length ? ` with ${p.variants.length} variants` : ''})`);
    }
  }

  // Summary counts
  const totalShops = await prisma.shop.count({ where: { status: 'ACTIVE' } });
  const totalProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
  console.log(`\nVerified ${isSupabase ? 'Supabase' : 'Local'}: ${totalShops} active shops, ${totalProducts} published products.`);
}

async function main() {
  console.log('Starting provisioning of 6 distinct new Ghanaian shops across categories...');
  // 1. Sync to local database
  await syncToDatabase(localPrisma, false);
  // 2. Sync to Supabase database
  await syncToDatabase(supabasePrisma, true);
  console.log('\nAll 6 shops successfully provisioned and synchronized across both databases!');
}

main()
  .catch((e) => {
    console.error('Provisioning failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
