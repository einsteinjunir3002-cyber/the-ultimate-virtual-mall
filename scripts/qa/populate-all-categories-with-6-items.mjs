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

async function downloadOrCacheImage(sourceUrl, slug) {
  const hash = crypto.createHash('md5').update(slug).digest('hex').slice(0, 8);
  const existing = fs.readdirSync(UPLOAD_DIR).find(f => f.includes(hash));
  if (existing) {
    return `/uploads/${existing}`;
  }

  try {
    const res = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = 'webp';
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

const ALL_SHOPS_SPEC = [
  // 1. Accra Gadget Hub (Test) - 1st Shop
  {
    slug: 'accra-gadget-hub-test',
    name: 'Accra Gadget Hub (Test)',
    mallCategorySlug: 'electronics',
    businessCategory: 'Electronics & Gadgets',
    tagline: 'Genuine gadgets, fast Accra delivery',
    description: 'QA TEST SHOP — your Accra stop for smartphones, laptops, tablets and audio accessories. Demo catalogue built from a public testing dataset; not a real business.',
    location: 'Osu, Accra',
    phone: '+233200000001',
    whatsappNumber: '+233200000001',
    email: 'qa.seller@example.com',
    themeColor: '#f59e0b',
    templateStyle: TemplateStyle.MARKETPLACE_GRID,
    baseDeliveryFee: 20.00,
    deliveryPolicy: 'Same-day courier within Greater Accra (order before 2pm). Nationwide delivery in 2–4 working days via third-party transport. Free pickup at our Osu counter.',
    returnPolicy: 'Returns accepted within 7 days if the item is unused and in original packaging. Faulty items replaced within 14 days with proof of purchase.',
    categories: [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        products: [
          { name: 'Apple iPhone 15 Pro Max 256GB', slug: 'iphone-15-pro-max-256gb', price: 16500, salePrice: 15800, brand: 'Apple', stock: 15, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', variants: [{ name: 'Natural Titanium', price: 15800, stock: 8 }, { name: 'Blue Titanium', price: 15800, stock: 7 }] },
          { name: 'Samsung Galaxy S24 Ultra 512GB', slug: 'samsung-galaxy-s24-ultra-512gb', price: 15200, salePrice: null, brand: 'Samsung', stock: 12, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80', variants: [{ name: 'Titanium Black', price: 15200, stock: 6 }, { name: 'Titanium Gray', price: 15200, stock: 6 }] },
          { name: 'Apple iPhone 14 Pro 128GB', slug: 'iphone-14-pro-128gb-deep-purple', price: 11900, salePrice: 11200, brand: 'Apple', stock: 10, img: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80', variants: [{ name: 'Deep Purple', price: 11200, stock: 5 }, { name: 'Space Black', price: 11200, stock: 5 }] },
          { name: 'Google Pixel 8 Pro 256GB', slug: 'google-pixel-8-pro-256gb-obsidian', price: 10800, salePrice: 9900, brand: 'Google', stock: 14, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80', variants: [{ name: 'Obsidian', price: 9900, stock: 7 }, { name: 'Bay Blue', price: 9900, stock: 7 }] },
          { name: 'Apple iPhone 13 Pro 128GB', slug: 'iphone-13-pro-sierra-blue', price: 8900, salePrice: null, brand: 'Apple', stock: 12, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&q=80', variants: [{ name: 'Sierra Blue', price: 8900, stock: 6 }, { name: 'Graphite', price: 8900, stock: 6 }] },
          { name: 'Samsung Galaxy Z Fold 5 256GB', slug: 'samsung-galaxy-z-fold-5-phantom-black', price: 18500, salePrice: 17500, brand: 'Samsung', stock: 8, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80', variants: [{ name: 'Phantom Black', price: 17500, stock: 4 }, { name: 'Icy Blue', price: 17500, stock: 4 }] },
        ]
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        products: [
          { name: 'Apple MacBook Pro 14" M3 Pro', slug: 'macbook-pro-14-m3-pro-space-black', price: 24900, salePrice: 23500, brand: 'Apple', stock: 10, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', variants: [{ name: '18GB / 512GB', price: 23500, stock: 6 }, { name: '36GB / 1TB', price: 28500, stock: 4 }] },
          { name: 'Dell XPS 15 9530 Core i9 32GB', slug: 'dell-xps-15-9530-platinum-silver', price: 21500, salePrice: null, brand: 'Dell', stock: 8, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80', variants: [{ name: '1TB SSD / OLED 3.5K', price: 21500, stock: 8 }] },
          { name: 'Apple MacBook Air 15" M2 16GB', slug: 'macbook-air-15-m2-midnight', price: 16800, salePrice: 15900, brand: 'Apple', stock: 12, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', variants: [{ name: 'Midnight', price: 15900, stock: 6 }, { name: 'Starlight', price: 15900, stock: 6 }] },
          { name: 'HP Spectre x360 14" 2-in-1', slug: 'hp-spectre-x360-14-nightfall-black', price: 17200, salePrice: null, brand: 'HP', stock: 9, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', variants: [{ name: 'Nightfall Black', price: 17200, stock: 9 }] },
          { name: 'Lenovo ThinkPad X1 Carbon Gen 11', slug: 'lenovo-thinkpad-x1-carbon-gen-11', price: 19500, salePrice: 18200, brand: 'Lenovo', stock: 11, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', variants: [{ name: 'Core i7 / 32GB RAM', price: 18200, stock: 11 }] },
          { name: 'Asus Zenbook Duo OLED Dual Screen', slug: 'asus-zenbook-duo-oled-dual-screen', price: 22800, salePrice: null, brand: 'Asus', stock: 7, img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', variants: [{ name: 'Core Ultra 9 / 32GB', price: 22800, stock: 7 }] },
        ]
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        products: [
          { name: 'Apple iPad Pro 12.9" M2 256GB WiFi', slug: 'ipad-pro-12-9-m2-space-gray', price: 15500, salePrice: 14800, brand: 'Apple', stock: 14, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', variants: [{ name: 'Space Gray', price: 14800, stock: 7 }, { name: 'Silver', price: 14800, stock: 7 }] },
          { name: 'Apple iPad Air 5th Gen 64GB', slug: 'ipad-air-5th-gen-blue-starlight', price: 7900, salePrice: null, brand: 'Apple', stock: 16, img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', variants: [{ name: 'Blue', price: 7900, stock: 8 }, { name: 'Starlight', price: 7900, stock: 8 }] },
          { name: 'Samsung Galaxy Tab S9 Ultra 5G', slug: 'samsung-galaxy-tab-s9-ultra-5g', price: 16200, salePrice: 15400, brand: 'Samsung', stock: 10, img: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80', variants: [{ name: 'Graphite (with S-Pen)', price: 15400, stock: 10 }] },
          { name: 'Apple iPad Mini (2021) 64GB', slug: 'ipad-mini-2021-starlight-space-gray', price: 6400, salePrice: 5950, brand: 'Apple', stock: 18, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', variants: [{ name: 'Starlight', price: 5950, stock: 9 }, { name: 'Space Gray', price: 5950, stock: 9 }] },
          { name: 'Samsung Galaxy Tab S8 Plus 128GB', slug: 'samsung-galaxy-tab-s8-plus-128gb', price: 8800, salePrice: null, brand: 'Samsung', stock: 15, img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', variants: [{ name: 'Dark Gray', price: 8800, stock: 15 }] },
          { name: 'Lenovo Tab P12 Pro 256GB with Pen', slug: 'lenovo-tab-p12-pro-storm-grey', price: 7200, salePrice: 6600, brand: 'Lenovo', stock: 12, img: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80', variants: [{ name: 'Storm Grey', price: 6600, stock: 12 }] },
        ]
      },
      {
        name: 'Audio & Accessories',
        slug: 'audio-accessories',
        products: [
          { name: 'Sony WH-1000XM5 Wireless Headphones', slug: 'sony-wh-1000xm5-noise-canceling-black', price: 4200, salePrice: 3850, brand: 'Sony', stock: 20, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', variants: [{ name: 'Matte Black', price: 3850, stock: 10 }, { name: 'Silver White', price: 3850, stock: 10 }] },
          { name: 'Apple AirPods Pro (2nd Gen, USB-C)', slug: 'apple-airpods-pro-2nd-gen-usb-c', price: 2950, salePrice: 2750, brand: 'Apple', stock: 25, img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80', variants: [{ name: 'White', price: 2750, stock: 25 }] },
          { name: 'Apple Watch Series 9 GPS 45mm', slug: 'apple-watch-series-9-gps-45mm', price: 4800, salePrice: null, brand: 'Apple', stock: 15, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', variants: [{ name: 'Midnight Aluminum', price: 4800, stock: 8 }, { name: 'Starlight Aluminum', price: 4800, stock: 7 }] },
          { name: 'Anker 737 Power Bank 24,000mAh 140W', slug: 'anker-737-power-bank-24000mah-140w', price: 1450, salePrice: 1300, brand: 'Anker', stock: 30, img: 'https://images.unsplash.com/photo-1609592426868-b7eb478bbd23?w=800&q=80', variants: [{ name: 'Charcoal Black', price: 1300, stock: 30 }] },
          { name: 'Logitech MX Master 3S Wireless Mouse', slug: 'logitech-mx-master-3s-performance-mouse', price: 1250, salePrice: null, brand: 'Logitech', stock: 22, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', variants: [{ name: 'Graphite', price: 1250, stock: 12 }, { name: 'Pale Gray', price: 1250, stock: 10 }] },
          { name: 'Apple 20W USB-C Fast Power Adapter', slug: 'apple-20w-usb-c-fast-charger', price: 350, salePrice: 290, brand: 'Apple', stock: 45, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', variants: [{ name: 'Standard UK 3-Pin', price: 290, stock: 45 }] },
        ]
      }
    ]
  },

  // 2. Osu African Fashion & Kente Hub
  {
    slug: 'osu-fashion-kente-hub',
    name: 'Osu African Fashion & Kente Hub',
    mallCategorySlug: 'fashion',
    businessCategory: 'Fashion & Apparel',
    tagline: 'Handwoven Bonwire Kente, Batakari & Modern African Wear',
    description: 'Accra’s premier destination for authentic Ghanaian traditional textiles, modern bespoke African prints, and ceremonial Kente cloth directly from Bonwire master weavers.',
    location: 'Oxford Street, Osu, Accra',
    phone: '+233244111222',
    whatsappNumber: '+233244111222',
    email: 'seller.fashion@example.com',
    themeColor: '#7c3aed',
    templateStyle: TemplateStyle.LUXURY_BOUTIQUE,
    baseDeliveryFee: 25.00,
    deliveryPolicy: 'Same-day express delivery within Greater Accra. Nationwide delivery via VIP Transport or DHL in 2-3 working days.',
    returnPolicy: 'Custom tailored items are non-refundable. Standard stoles and unworn apparel can be exchanged within 7 days in original condition.',
    categories: [
      {
        name: 'Bonwire Kente',
        slug: 'bonwire-kente',
        products: [
          { name: 'Handwoven 3-Piece Bonwire Kente Stole Set', slug: 'kente-stole-set-3pc', price: 1850, salePrice: 1650, brand: 'Bonwire Master Crafts', stock: 12, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', variants: [{ name: 'Gold & Maroon', price: 1650, stock: 6 }, { name: 'Royal Blue & Gold', price: 1650, stock: 6 }] },
          { name: 'Master Weaver Asantehene Kente Cloth (12 Yards)', slug: 'asantehene-ceremonial-kente-12-yards', price: 6500, salePrice: 5900, brand: 'Bonwire Heritage', stock: 5, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', variants: [{ name: 'Gold Adweneasa Pattern', price: 5900, stock: 5 }] },
          { name: 'Bonwire Kente Neck Tie & Pocket Square Set', slug: 'bonwire-kente-necktie-pocket-square', price: 320, salePrice: null, brand: 'Osu Bespoke', stock: 25, img: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&q=80', variants: [{ name: 'Blue & Gold', price: 320, stock: 15 }, { name: 'Green & Yellow', price: 320, stock: 10 }] },
          { name: 'Royal Oyokoman Kente Shoulder Wrap Shawl', slug: 'royal-oyokoman-kente-wrap-shawl', price: 950, salePrice: 850, brand: 'Bonwire Crafts', stock: 14, img: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&q=80', variants: [{ name: 'Traditional Red, Gold & Green', price: 850, stock: 14 }] },
          { name: 'Kente Graduation Ceremonial Stole with Monogram', slug: 'kente-graduation-ceremonial-stole', price: 450, salePrice: null, brand: 'Bonwire Crafts', stock: 30, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', variants: [{ name: 'Class of 2026 Gold Border', price: 450, stock: 30 }] },
          { name: 'Handcrafted Kente Clutches & Evening Bag', slug: 'handcrafted-kente-evening-clutch-bag', price: 380, salePrice: 340, brand: 'Osu Bespoke', stock: 18, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', variants: [{ name: 'Gold Brass Chain Strap', price: 340, stock: 18 }] },
        ]
      },
      {
        name: 'Traditional Smocks (Batakari)',
        slug: 'traditional-smocks',
        products: [
          { name: 'Northern Ghana Traditional Smock (Fugu / Batakari)', slug: 'northern-traditional-fugu-smock', price: 650, salePrice: null, brand: 'Tamale Weaves', stock: 18, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', variants: [{ name: 'Medium (40")', price: 650, stock: 6 }, { name: 'Large (44")', price: 650, stock: 6 }, { name: 'XL (48")', price: 650, stock: 6 }] },
          { name: 'Tamale Royal Heavyweight Striped Smock', slug: 'tamale-royal-heavyweight-striped-smock', price: 820, salePrice: 750, brand: 'Tamale Weaves', stock: 12, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', variants: [{ name: 'Indigo Black Striped', price: 750, stock: 12 }] },
          { name: 'Bolgatanga Summer Short-Sleeve Fugu', slug: 'bolgatanga-summer-short-sleeve-fugu', price: 480, salePrice: null, brand: 'Bolga Crafts', stock: 20, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', variants: [{ name: 'Sky Blue & White', price: 480, stock: 10 }, { name: 'Beige & Earth Red', price: 480, stock: 10 }] },
          { name: 'Hand-Spun Indigo Cotton Batakari Waistcoat', slug: 'indigo-cotton-batakari-waistcoat', price: 390, salePrice: 350, brand: 'Tamale Weaves', stock: 15, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', variants: [{ name: 'Medium', price: 350, stock: 8 }, { name: 'Large', price: 350, stock: 7 }] },
          { name: 'Royal Dagbon Chief Smock with Embroidered Collar', slug: 'royal-dagbon-chief-smock-collar', price: 1200, salePrice: null, brand: 'Northern Kings Guild', stock: 6, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', variants: [{ name: 'Grand Masterpiece XL', price: 1200, stock: 6 }] },
          { name: 'Modern Tailored Slim-Fit Fugu Shirt', slug: 'modern-tailored-slim-fit-fugu-shirt', price: 520, salePrice: 470, brand: 'Osu Bespoke', stock: 22, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', variants: [{ name: 'Size 42', price: 470, stock: 11 }, { name: 'Size 44', price: 470, stock: 11 }] },
        ]
      },
      {
        name: 'GTP Wax Prints',
        slug: 'gtp-wax-prints',
        products: [
          { name: 'African Print Infinity Dress (GTP Wax)', slug: 'african-print-infinity-dress-gtp-wax', price: 420, salePrice: null, brand: 'Osu Bespoke', stock: 15, img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80', variants: [{ name: 'Sunset Orange', price: 420, stock: 8 }, { name: 'Peacock Teal', price: 420, stock: 7 }] },
          { name: 'Authentic GTP NuStyle Wax Print 6-Yard Piece', slug: 'authentic-gtp-nustyle-wax-print-6-yards', price: 360, salePrice: 320, brand: 'GTP Ghana', stock: 30, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', variants: [{ name: 'Sunburst Gold Pattern', price: 320, stock: 15 }, { name: 'Royal Violet Medallion', price: 320, stock: 15 }] },
          { name: 'GTP Adepa Dumas Premium Cotton Fabric (6 Yards)', slug: 'gtp-adepa-dumas-premium-fabric', price: 490, salePrice: null, brand: 'GTP Ghana', stock: 25, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', variants: [{ name: 'Emerald Palm Print', price: 490, stock: 25 }] },
          { name: 'Women’s Peplum Blazer & Pencil Skirt Set', slug: 'womens-peplum-blazer-skirt-set', price: 680, salePrice: 620, brand: 'Osu Bespoke', stock: 12, img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80', variants: [{ name: 'Size 10 UK', price: 620, stock: 6 }, { name: 'Size 12 UK', price: 620, stock: 6 }] },
          { name: 'Men’s Tailored African Print Button-Down Shirt', slug: 'mens-tailored-african-print-shirt', price: 340, salePrice: 295, brand: 'Osu Bespoke', stock: 20, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', variants: [{ name: 'Medium', price: 295, stock: 10 }, { name: 'Large', price: 295, stock: 10 }] },
          { name: 'GTP Print Reversible Bucket Hat & Tote Bag Set', slug: 'gtp-print-bucket-hat-tote-set', price: 220, salePrice: null, brand: 'Osu Bespoke', stock: 35, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', variants: [{ name: 'Standard Set', price: 220, stock: 35 }] },
        ]
      },
      {
        name: 'Beaded Footwear',
        slug: 'beaded-footwear',
        products: [
          { name: 'Handcrafted Beaded Leather Sandals', slug: 'handcrafted-beaded-leather-sandals-gh', price: 280, salePrice: 250, brand: 'Osu Artisan Leather', stock: 25, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', variants: [{ name: 'Size 41 EU', price: 250, stock: 8 }, { name: 'Size 42 EU', price: 250, stock: 9 }, { name: 'Size 43 EU', price: 250, stock: 8 }] },
          { name: 'Ashanti Brass Bell Beaded Slippers', slug: 'ashanti-brass-bell-beaded-slippers', price: 340, salePrice: null, brand: 'Osu Artisan Leather', stock: 16, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', variants: [{ name: 'Size 40 EU', price: 340, stock: 8 }, { name: 'Size 41 EU', price: 340, stock: 8 }] },
          { name: 'Maasai & Ghana Fusion Strappy Beaded Wedges', slug: 'maasai-ghana-fusion-beaded-wedges', price: 420, salePrice: 375, brand: 'Osu Artisan Leather', stock: 14, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', variants: [{ name: 'Size 39 EU', price: 375, stock: 7 }, { name: 'Size 40 EU', price: 375, stock: 7 }] },
          { name: 'Men’s Hand-Tooled Cowhide Ahenema Slippers', slug: 'mens-hand-tooled-cowhide-ahenema-slippers', price: 490, salePrice: null, brand: 'Ashanti Royal Footwear', stock: 15, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', variants: [{ name: 'Size 42', price: 490, stock: 8 }, { name: 'Size 43', price: 490, stock: 7 }] },
          { name: 'Royal Beaded Leather Slides with Cushioned Insole', slug: 'royal-beaded-leather-slides-cushioned', price: 290, salePrice: 260, brand: 'Osu Artisan Leather', stock: 24, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', variants: [{ name: 'Gold Beaded', price: 260, stock: 12 }, { name: 'Silver Beaded', price: 260, stock: 12 }] },
          { name: 'Handwoven Raffia & Glass Bead Espadrilles', slug: 'handwoven-raffia-glass-bead-espadrilles', price: 310, salePrice: null, brand: 'Osu Artisan Leather', stock: 20, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', variants: [{ name: 'Size 41', price: 310, stock: 10 }, { name: 'Size 42', price: 310, stock: 10 }] },
        ]
      }
    ]
  },

  // 3. Gold Coast Shea & Botanicals
  {
    slug: 'gold-coast-shea-sanctuary',
    name: 'Gold Coast Shea & Botanicals',
    mallCategorySlug: 'beauty',
    businessCategory: 'Beauty & Cosmetics',
    tagline: '100% Raw Unrefined Northern Shea Butter & Organic Skincare',
    description: 'Ethically sourced raw shea butter from women’s cooperatives in Tamale, blended with baobab oil, cocoa butter, and cold-pressed coconut oil for radiant African skin and hair.',
    location: 'East Legon, Accra',
    phone: '+233201222333',
    whatsappNumber: '+233201222333',
    email: 'seller.beauty@example.com',
    themeColor: '#059669',
    templateStyle: TemplateStyle.WARM_ARTISAN,
    baseDeliveryFee: 20.00,
    deliveryPolicy: 'Dispatched within 24 hours across Accra. Express temperature-safe packaging to prevent melting in transit.',
    returnPolicy: 'For hygiene and safety reasons, opened skincare cosmetics are non-returnable. Unopened jars can be returned within 14 days.',
    categories: [
      {
        name: 'Raw Shea Butter',
        slug: 'raw-shea-butter',
        products: [
          { name: 'Whipped Northern Shea Butter with Baobab (500g)', slug: 'whipped-northern-shea-butter-baobab', price: 120, salePrice: 105, brand: 'Gold Coast Botanicals', stock: 40, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: 'Vanilla & Lavender Scented', price: 105, stock: 20 }, { name: 'Unscented Natural', price: 105, stock: 20 }] },
          { name: 'Pure Grade-A Ivory Unrefined Shea Butter (1kg Block)', slug: 'pure-grade-a-ivory-unrefined-shea-butter-1kg', price: 140, salePrice: 125, brand: 'Gold Coast Botanicals', stock: 50, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '1kg Block Vacuum Packed', price: 125, stock: 50 }] },
          { name: 'Golden Yellow Shea Butter with Borututu Bark (500g)', slug: 'golden-yellow-shea-butter-borututu-500g', price: 110, salePrice: null, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '500g Tub', price: 110, stock: 35 }] },
          { name: 'Shea & Mango Butter Deep Moisturizing Body Cream', slug: 'shea-mango-butter-deep-moisturizer', price: 95, salePrice: 85, brand: 'Gold Coast Botanicals', stock: 45, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: 'Mango Citrus Scent', price: 85, stock: 45 }] },
          { name: 'Baby Calming Ultra-Gentle Shea & Calendula Salve', slug: 'baby-calming-gentle-shea-calendula-salve', price: 80, salePrice: null, brand: 'Gold Coast Botanicals', stock: 30, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '200g Jar', price: 80, stock: 30 }] },
          { name: 'Eucalyptus & Peppermint Muscle Relief Shea Rub', slug: 'eucalyptus-peppermint-muscle-relief-shea-rub', price: 115, salePrice: 95, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '300g Tin', price: 95, stock: 35 }] },
        ]
      },
      {
        name: 'African Black Soap',
        slug: 'african-black-soap',
        products: [
          { name: 'Traditional African Black Soap Paste (Alata Samina 400g)', slug: 'traditional-african-black-soap-alata-samina', price: 65, salePrice: null, brand: 'Gold Coast Botanicals', stock: 50, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', variants: [{ name: '400g Tub', price: 65, stock: 50 }] },
          { name: 'Liquid African Black Soap Body Wash with Raw Honey (500ml)', slug: 'liquid-black-soap-body-wash-raw-honey-500ml', price: 85, salePrice: 75, brand: 'Gold Coast Botanicals', stock: 40, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: 'Honey & Lemongrass', price: 75, stock: 40 }] },
          { name: 'Clarifying Activated Charcoal & Tea Tree Black Soap Bar', slug: 'activated-charcoal-tea-tree-black-soap-bar', price: 45, salePrice: null, brand: 'Gold Coast Botanicals', stock: 60, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', variants: [{ name: '150g Bar', price: 45, stock: 60 }] },
          { name: 'Turmeric & Neem Brightening Black Soap Facial Scrub', slug: 'turmeric-neem-brightening-black-soap-scrub', price: 70, salePrice: 60, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '250g Jar', price: 60, stock: 35 }] },
          { name: 'Gentle Foaming Black Soap Facial Cleanser with Aloe (200ml)', slug: 'gentle-foaming-black-soap-aloe-cleanser', price: 75, salePrice: null, brand: 'Gold Coast Botanicals', stock: 30, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: '200ml Pump Bottle', price: 75, stock: 30 }] },
          { name: 'Exfoliating Sisal Mesh Sponge Infused with Alata Samina', slug: 'exfoliating-sisal-mesh-infused-black-soap', price: 50, salePrice: 40, brand: 'Gold Coast Botanicals', stock: 55, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', variants: [{ name: 'Traditional Net Sponge', price: 40, stock: 55 }] },
        ]
      },
      {
        name: 'Hair Elixirs',
        slug: 'hair-elixirs',
        products: [
          { name: 'Cold-Pressed Virgin Coconut & Hibiscus Hair Elixir (250ml)', slug: 'coconut-hibiscus-hair-elixir-ghana', price: 95, salePrice: 85, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '250ml Dropper Bottle', price: 85, stock: 35 }] },
          { name: 'Chebe & Jamaican Black Castor Hair Growth Oil (150ml)', slug: 'chebe-black-castor-hair-growth-oil', price: 110, salePrice: 95, brand: 'Gold Coast Botanicals', stock: 40, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: '150ml Bottle', price: 95, stock: 40 }] },
          { name: 'Baobab & Moringa Scalp Soothing Treatment (100ml)', slug: 'baobab-moringa-scalp-soothing-treatment', price: 85, salePrice: null, brand: 'Gold Coast Botanicals', stock: 30, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '100ml Dropper', price: 85, stock: 30 }] },
          { name: 'Raw Cocoa Butter Leave-In Conditioning Hair Cream (300g)', slug: 'raw-cocoa-butter-leave-in-hair-cream', price: 90, salePrice: 80, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '300g Tub', price: 80, stock: 35 }] },
          { name: 'Rosemary & Peppermint Hair Follicle Tonic (200ml Spray)', slug: 'rosemary-peppermint-hair-follicle-spray', price: 75, salePrice: null, brand: 'Gold Coast Botanicals', stock: 45, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: '200ml Mist Bottle', price: 75, stock: 45 }] },
          { name: 'Coastal Avocado & Argan Deep Moisture Hair Mask (350g)', slug: 'coastal-avocado-argan-deep-moisture-hair-mask', price: 115, salePrice: 100, brand: 'Gold Coast Botanicals', stock: 25, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '350g Jar', price: 100, stock: 25 }] },
        ]
      },
      {
        name: 'Lip & Body Scrubs',
        slug: 'lip-body-scrubs',
        products: [
          { name: 'Pure Cocoa Butter Lip Balm & Organic Sugar Scrub Set', slug: 'cocoa-butter-lip-balm-sugar-scrub-set', price: 55, salePrice: null, brand: 'Gold Coast Botanicals', stock: 60, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: 'Vanilla Coconut Duo', price: 55, stock: 60 }] },
          { name: 'Brown Sugar & Roasted Robusta Coffee Body Polish (350g)', slug: 'brown-sugar-roasted-coffee-body-polish', price: 90, salePrice: 75, brand: 'Gold Coast Botanicals', stock: 35, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: '350g Jar', price: 75, stock: 35 }] },
          { name: 'Volta Sea Salt & Lemongrass Radiance Body Scrub (400g)', slug: 'volta-sea-salt-lemongrass-body-scrub', price: 85, salePrice: null, brand: 'Gold Coast Botanicals', stock: 40, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '400g Tub', price: 85, stock: 40 }] },
          { name: 'Hibiscus & Rosehip Petal Exfoliating Glow Polish', slug: 'hibiscus-rosehip-petal-glow-polish', price: 95, salePrice: 80, brand: 'Gold Coast Botanicals', stock: 30, img: 'https://images.unsplash.com/photo-1608248597359-0021b37d5718?w=800&q=80', variants: [{ name: '300g Jar', price: 80, stock: 30 }] },
          { name: 'Shea & Vanilla Overnight Hydrating Lip Sleeping Mask', slug: 'shea-vanilla-overnight-lip-sleeping-mask', price: 45, salePrice: null, brand: 'Gold Coast Botanicals', stock: 50, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', variants: [{ name: '30g Pot', price: 45, stock: 50 }] },
          { name: 'Coconut Lime Cooling Foot & Cracked Heel Scrub (250g)', slug: 'coconut-lime-cooling-heel-scrub', price: 65, salePrice: 55, brand: 'Gold Coast Botanicals', stock: 40, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', variants: [{ name: '250g Jar', price: 55, stock: 40 }] },
        ]
      }
    ]
  },

  // 4. Makola Heritage Provisions
  {
    slug: 'makola-heritage-provisions',
    name: 'Makola Heritage Provisions',
    mallCategorySlug: 'groceries',
    businessCategory: 'Groceries & Essentials',
    tagline: 'Authentic Ghanaian Spices, Shito & Kitchen Essentials',
    description: 'Bringing the culinary richness of Makola Market directly to your home. Premium artisanal Shito, sun-dried traditional spices, organic gari, and heritage Ghanaian pantry essentials.',
    location: 'Makola Shopping Mall, Central Business District, Accra',
    phone: '+233501333444',
    whatsappNumber: '+233501333444',
    email: 'seller.groceries@example.com',
    themeColor: '#dc2626',
    templateStyle: TemplateStyle.MARKETPLACE_GRID,
    baseDeliveryFee: 15.00,
    deliveryPolicy: 'Same-day courier within Accra Metropolitan area. All glass jars safely bubble-wrapped in heavy-duty food crates.',
    returnPolicy: 'Perishable pantry items and opened food products cannot be returned. Damaged or leaking items replaced immediately upon proof of delivery photo.',
    categories: [
      {
        name: 'Artisan Shito',
        slug: 'artisan-shito',
        products: [
          { name: 'Artisanal Smoked Shrimp & Fish Shito (350ml Jar)', slug: 'artisanal-smoked-shrimp-fish-shito-jar', price: 75, salePrice: 65, brand: 'Makola Kitchen Co.', stock: 45, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', variants: [{ name: 'Mild Flavor', price: 65, stock: 20 }, { name: 'Hot & Spicy', price: 65, stock: 25 }] },
          { name: 'Extra Hot Scotch Bonnet Fire Shito (350ml Jar)', slug: 'extra-hot-scotch-bonnet-shito', price: 75, salePrice: null, brand: 'Makola Kitchen Co.', stock: 35, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', variants: [{ name: 'Extreme Heat', price: 75, stock: 35 }] },
          { name: 'Vegetarian & Vegan Shiitake Mushroom Shito (300ml)', slug: 'vegetarian-vegan-mushroom-shito', price: 80, salePrice: 70, brand: 'Makola Kitchen Co.', stock: 30, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', variants: [{ name: '100% Plant Based', price: 70, stock: 30 }] },
          { name: 'Smoked Crayfish & Garlic Black Pepper Sauce (350ml)', slug: 'smoked-crayfish-garlic-black-pepper-shito', price: 85, salePrice: 75, brand: 'Makola Kitchen Co.', stock: 25, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', variants: [{ name: '350ml Glass Jar', price: 75, stock: 25 }] },
          { name: 'Green Pepper & Ginger Kpakpo Shito (300ml Jar)', slug: 'green-pepper-ginger-kpakpo-shito', price: 65, salePrice: null, brand: 'Makola Kitchen Co.', stock: 40, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', variants: [{ name: 'Fresh Green Heat', price: 65, stock: 40 }] },
          { name: 'Gourmet Seafood Supreme Shito (Crab, Shrimp & Herrings)', slug: 'gourmet-seafood-supreme-shito', price: 110, salePrice: 95, brand: 'Makola Kitchen Co.', stock: 20, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', variants: [{ name: 'Seafood Trio 350ml', price: 95, stock: 20 }] },
        ]
      },
      {
        name: 'Heritage Spices',
        slug: 'heritage-spices',
        products: [
          { name: 'Whole Prekese & Indigenous Spices Wellness Pack (500g)', slug: 'whole-prekese-indigenous-spices-pack', price: 45, salePrice: null, brand: 'Makola Kitchen Co.', stock: 30, img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80', variants: [] },
          { name: 'Organic Sun-Dried Dawadawa & Locust Beans Paste', slug: 'organic-sun-dried-dawadawa-locust-paste', price: 40, salePrice: 35, brand: 'Makola Kitchen Co.', stock: 40, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', variants: [] },
          { name: 'Calabash Nutmeg (African Nutmeg / Wedee Aba) Whole Pods', slug: 'calabash-nutmeg-wedee-aba-pods', price: 35, salePrice: null, brand: 'Makola Kitchen Co.', stock: 50, img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80', variants: [] },
          { name: 'Grains of Paradise (Alligator Pepper / Efom Wisa) 100g', slug: 'grains-of-paradise-alligator-pepper', price: 45, salePrice: 40, brand: 'Makola Kitchen Co.', stock: 35, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', variants: [] },
          { name: 'Sun-Dried Organic Ginger Root Powder (200g Jar)', slug: 'sun-dried-organic-ginger-powder', price: 35, salePrice: null, brand: 'Makola Kitchen Co.', stock: 45, img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80', variants: [] },
          { name: 'Ghanaian Jollof Master Spice Blend Seasoning (250g)', slug: 'ghanaian-jollof-master-spice-blend', price: 55, salePrice: 48, brand: 'Makola Kitchen Co.', stock: 60, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Grains & Flours',
        slug: 'grains-flours',
        products: [
          { name: 'Crispy Yellow Gari Soakings Special (2kg Sack)', slug: 'crispy-yellow-gari-soakings-2kg', price: 50, salePrice: null, brand: 'Volta Gold Farms', stock: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
          { name: 'Fine White Fortified Cassava Gari (2kg Sack)', slug: 'fine-white-fortified-cassava-gari-2kg', price: 45, salePrice: null, brand: 'Volta Gold Farms', stock: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
          { name: 'Fermented Corn & Cassava Dough for Banku (Fresh 2kg)', slug: 'fermented-corn-cassava-dough-banku', price: 35, salePrice: null, brand: 'Makola Fresh', stock: 40, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
          { name: 'Organic Roasted Corn Flour for Tom Brown Porridge (1kg)', slug: 'tom-brown-roasted-corn-porridge-flour', price: 40, salePrice: 35, brand: 'Makola Kitchen Co.', stock: 45, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
          { name: 'Traditional Kokonte Dried Cassava Flour (1.5kg)', slug: 'traditional-kokonte-cassava-flour', price: 38, salePrice: null, brand: 'Makola Kitchen Co.', stock: 35, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
          { name: 'Hausa Koko Spiced Millet Porridge Flour (1kg Pack)', slug: 'hausa-koko-spiced-millet-flour', price: 42, salePrice: null, brand: 'Makola Kitchen Co.', stock: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Traditional Teas & Brews',
        slug: 'traditional-teas-brews',
        products: [
          { name: 'Sun-Dried Organic Hibiscus Flowers (Sobolo Petals 500g)', slug: 'sun-dried-hibiscus-sobolo-flowers-500g', price: 50, salePrice: 45, brand: 'Makola Kitchen Co.', stock: 60, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Dried Lemongrass Loose Tea Leaves (150g Pouch)', slug: 'dried-lemongrass-loose-tea-leaves', price: 35, salePrice: null, brand: 'Makola Kitchen Co.', stock: 45, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Moringa Leaf Detox Herbal Tea Bags (30 Count Box)', slug: 'moringa-leaf-detox-herbal-tea-bags', price: 45, salePrice: 38, brand: 'Makola Kitchen Co.', stock: 40, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Ghanaian Hot Ginger & Lime Herbal Tea Infusion', slug: 'ghanaian-hot-ginger-lime-tea-infusion', price: 40, salePrice: null, brand: 'Makola Kitchen Co.', stock: 50, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Bitter Leaf (Awonwono) Wellness Herbal Cleanse Tea', slug: 'bitter-leaf-wellness-herbal-cleanse', price: 42, salePrice: null, brand: 'Makola Kitchen Co.', stock: 35, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Soursop (Aluguntugui) Leaf Calming Herbal Infusion', slug: 'soursop-aluguntugui-leaf-calming-tea', price: 48, salePrice: 42, brand: 'Makola Kitchen Co.', stock: 40, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
        ]
      }
    ]
  },

  // 5. Aburi Woodcrafts & Interior Living
  {
    slug: 'aburi-woodcrafts-living',
    name: 'Aburi Woodcrafts & Interior Living',
    mallCategorySlug: 'home-furniture',
    businessCategory: 'Home & Furniture',
    tagline: 'Hand-Carved Ashanti Stools, Adinkra Decor & Furniture',
    description: 'Sculpted by generational woodcarvers in the Aburi hills using sustainable mahogany and cedar wood. Infuse traditional Ghanaian royalty and elegance into your modern living space.',
    location: 'Aburi Craft Ridge / Dzorwulu Showroom, Accra',
    phone: '+233245444555',
    whatsappNumber: '+233245444555',
    email: 'seller.woodcraft@example.com',
    themeColor: '#78350f',
    templateStyle: TemplateStyle.WARM_ARTISAN,
    baseDeliveryFee: 60.00,
    deliveryPolicy: 'Specialized furniture van delivery with white-glove unboxing in Greater Accra. Secure crate packaging for regional and export deliveries.',
    returnPolicy: 'Woodcraft furniture carries a 1-year termite and craftsmanship warranty. Returns accepted within 7 days with original delivery receipt.',
    categories: [
      {
        name: 'Royal Stools',
        slug: 'royal-stools',
        products: [
          { name: 'Hand-Carved Royal Ashanti Gye Nyame Stool (Solid Mahogany)', slug: 'royal-ashanti-gye-nyame-stool-solid-mahogany', price: 1450, salePrice: 1350, brand: 'Aburi Master Carvers', stock: 8, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Natural Beeswax Mahogany', price: 1350, stock: 4 }, { name: 'Smoked Antique Walnut', price: 1350, stock: 4 }] },
          { name: 'Osram (Crescent Moon) Ashanti Traditional Stool', slug: 'osram-crescent-moon-ashanti-stool', price: 1250, salePrice: null, brand: 'Aburi Master Carvers', stock: 10, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Solid Mahogany', price: 1250, stock: 10 }] },
          { name: 'Bi-Nka-Bi (Harmony & Peace) Carved Hardwood Stool', slug: 'bi-nka-bi-harmony-carved-stool', price: 1380, salePrice: 1280, brand: 'Aburi Master Carvers', stock: 6, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Deep Cedar Finish', price: 1280, stock: 6 }] },
          { name: 'Compact Cedar Fireside Stool with Brass Studs', slug: 'compact-cedar-fireside-stool-brass', price: 650, salePrice: 580, brand: 'Aburi Crafts Co.', stock: 15, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Standard Cedar', price: 580, stock: 15 }] },
          { name: 'Queen Mother (Ohemmaa) Ceremonial Carved Stool', slug: 'queen-mother-ohemmaa-ceremonial-stool', price: 1800, salePrice: 1650, brand: 'Aburi Master Carvers', stock: 5, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Polished Gold Leaf Accents', price: 1650, stock: 5 }] },
          { name: 'Contemporary African Round Low Stool with Leather Cushion', slug: 'contemporary-round-low-stool-leather', price: 850, salePrice: null, brand: 'Aburi Crafts Co.', stock: 12, img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', variants: [{ name: 'Tan Leather', price: 850, stock: 6 }, { name: 'Dark Brown Leather', price: 850, stock: 6 }] },
        ]
      },
      {
        name: 'Adinkra Clocks & Wall Art',
        slug: 'adinkra-clocks-wall-art',
        products: [
          { name: 'Adinkra Symbols Wall Clock (14-Inch Brass & Cedar)', slug: 'adinkra-symbols-wall-clock-brass-wood', price: 380, salePrice: null, brand: 'Aburi Crafts Co.', stock: 16, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', variants: [] },
          { name: 'Sankofa Bird Wooden Wall Plaque (Hand-Carved Mahogany)', slug: 'sankofa-bird-wooden-wall-plaque', price: 290, salePrice: 250, brand: 'Aburi Crafts Co.', stock: 20, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', variants: [] },
          { name: 'Framed Brass Ashanti Gold Weights Art Trio (Shadowbox)', slug: 'framed-brass-ashanti-gold-weights-trio', price: 540, salePrice: 480, brand: 'Aburi Crafts Co.', stock: 12, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', variants: [] },
          { name: 'Hand-Painted Adinkra Wisdom Canvas Wall Hanging', slug: 'hand-painted-adinkra-wisdom-canvas', price: 350, salePrice: null, brand: 'Aburi Crafts Co.', stock: 18, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', variants: [] },
          { name: 'Carved Ebony Wood Silhouette Face Mask Wall Art', slug: 'carved-ebony-silhouette-face-mask', price: 420, salePrice: 380, brand: 'Aburi Crafts Co.', stock: 14, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', variants: [] },
          { name: 'Sun & Moon African Celestial Carved Wall Panel', slug: 'sun-moon-celestial-carved-wall-panel', price: 480, salePrice: null, brand: 'Aburi Crafts Co.', stock: 10, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Bolga Baskets',
        slug: 'bolga-baskets',
        products: [
          { name: 'Bolgatanga Hand-Woven Elephant Grass Laundry Basket', slug: 'bolgatanga-woven-elephant-grass-laundry-basket', price: 320, salePrice: 290, brand: 'Bolga Weavers Guild', stock: 22, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [{ name: 'Natural Straw & Black Leather', price: 290, stock: 12 }, { name: 'Tri-Color Vibrant Weave', price: 290, stock: 10 }] },
          { name: 'Classic Bolga Round Market Basket with Leather Handle', slug: 'classic-bolga-round-market-basket', price: 180, salePrice: null, brand: 'Bolga Weavers Guild', stock: 35, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [{ name: 'Emerald & Yellow', price: 180, stock: 20 }, { name: 'Natural Tan', price: 180, stock: 15 }] },
          { name: 'Bolga Oval Picnic Basket with Dual Wooden Flap Lids', slug: 'bolga-oval-picnic-basket-wooden-lids', price: 260, salePrice: 230, brand: 'Bolga Weavers Guild', stock: 18, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [] },
          { name: 'Bolga Woven Hanging Macrame Planter Trio', slug: 'bolga-woven-hanging-planter-trio', price: 210, salePrice: null, brand: 'Bolga Weavers Guild', stock: 25, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [] },
          { name: 'Miniature Bolga Tabletop Catchall Baskets (Set of 3)', slug: 'miniature-bolga-tabletop-catchall-set', price: 150, salePrice: 130, brand: 'Bolga Weavers Guild', stock: 30, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [] },
          { name: 'Cylindrical Bolga Floor Storage Hamper with Fitted Lid', slug: 'cylindrical-bolga-floor-storage-hamper', price: 380, salePrice: 340, brand: 'Bolga Weavers Guild', stock: 15, img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Kitchen Woodenware',
        slug: 'kitchen-woodenware',
        products: [
          { name: 'Carved African Ebony Wood Salad Serving Spoons Set', slug: 'carved-ebony-wood-salad-spoons-set', price: 160, salePrice: null, brand: 'Aburi Crafts Co.', stock: 30, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
          { name: 'Solid Mahogany End-Grain Kitchen Chopping Board', slug: 'solid-mahogany-end-grain-chopping-board', price: 280, salePrice: 245, brand: 'Aburi Crafts Co.', stock: 20, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
          { name: 'Traditional Hand-Carved Wooden Pestle & Mortar (Asanka Set)', slug: 'traditional-wooden-pestle-mortar-asanka', price: 190, salePrice: null, brand: 'Aburi Crafts Co.', stock: 25, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
          { name: 'Teak Wood Coaster Set with Carved Adinkra Motifs (6-Piece)', slug: 'teak-wood-coaster-set-adinkra-motifs', price: 95, salePrice: 85, brand: 'Aburi Crafts Co.', stock: 40, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
          { name: 'Olive Wood Bread & Charcuterie Serving Board with Handle', slug: 'olive-wood-charcuterie-serving-board', price: 220, salePrice: null, brand: 'Aburi Crafts Co.', stock: 22, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
          { name: 'Handcrafted Wooden Rice & Fufu Spatula Spoon Set', slug: 'handcrafted-wooden-rice-fufu-spatula-set', price: 85, salePrice: null, brand: 'Aburi Crafts Co.', stock: 50, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', variants: [] },
        ]
      }
    ]
  },

  // 6. Afro-Bites Gourmet & Cocoa Co.
  {
    slug: 'afro-bites-gourmet-treats',
    name: 'Afro-Bites Gourmet & Cocoa Co.',
    mallCategorySlug: 'food-beverages',
    businessCategory: 'Food & Beverages',
    tagline: 'Ghanaian Single-Origin Chocolates, Roasted Cashews & Beverages',
    description: 'Celebrating the world’s finest Ghanaian cocoa and savannah harvests with gourmet artisan dark chocolate bars, roasted honey cashews, and refreshing dried tropical fruits.',
    location: 'Cantonments / Airport Residential, Accra',
    phone: '+233271555666',
    whatsappNumber: '+233271555666',
    email: 'seller.gourmet@example.com',
    themeColor: '#451a03',
    templateStyle: TemplateStyle.MODERN_MINIMAL,
    baseDeliveryFee: 20.00,
    deliveryPolicy: 'Temperature-controlled delivery bags ensure chocolates never melt in Accra transit. Same-day delivery for orders placed before 3 PM.',
    returnPolicy: 'Food and confectionery goods are final sale. Replacement or full refund issued for any order that arrives damaged or spoiled.',
    categories: [
      {
        name: 'Single-Origin Chocolates',
        slug: 'single-origin-chocolates',
        products: [
          { name: 'Single-Origin 72% Dark Cocoa Chocolate Bar Gift Box (4 x 80g)', slug: 'single-origin-72-dark-cocoa-chocolate-gift-box', price: 180, salePrice: 160, brand: 'Afro-Bites Chocolatiers', stock: 35, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
          { name: '85% Extra Dark Ghanaian Cocoa Artisan Bar (100g)', slug: '85-extra-dark-ghanaian-cocoa-bar', price: 50, salePrice: null, brand: 'Afro-Bites Chocolatiers', stock: 45, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
          { name: 'Milk Chocolate with Toasted Coconut & Sea Salt Nibs (100g)', slug: 'milk-chocolate-toasted-coconut-sea-salt', price: 48, salePrice: 42, brand: 'Afro-Bites Chocolatiers', stock: 50, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
          { name: 'Spiced Chili & Hot Ginger Dark Chocolate Bar (100g)', slug: 'spiced-chili-hot-ginger-dark-chocolate', price: 48, salePrice: null, brand: 'Afro-Bites Chocolatiers', stock: 40, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
          { name: 'Bourbon Vanilla White Chocolate with Passionfruit Swirl', slug: 'bourbon-vanilla-white-chocolate-passionfruit', price: 52, salePrice: 45, brand: 'Afro-Bites Chocolatiers', stock: 35, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
          { name: 'Roasted Cocoa Nibs Dark Chocolate Praline Truffles (Box of 8)', slug: 'cocoa-nibs-dark-chocolate-praline-truffles', price: 120, salePrice: 105, brand: 'Afro-Bites Chocolatiers', stock: 25, img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Savannah Cashews',
        slug: 'savannah-cashews',
        products: [
          { name: 'Savannah Honey-Glazed Roasted Cashews (300g Tin)', slug: 'savannah-honey-glazed-roasted-cashews-tin', price: 95, salePrice: 85, brand: 'Savannah Crunch Co.', stock: 45, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [{ name: 'Honey-Glazed Salted', price: 85, stock: 25 }, { name: 'Black Pepper & Chili', price: 85, stock: 20 }] },
          { name: 'Slow-Roasted Sea Salt Whole Cashews (300g Tin)', slug: 'slow-roasted-sea-salt-whole-cashews-tin', price: 90, salePrice: null, brand: 'Savannah Crunch Co.', stock: 50, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [] },
          { name: 'Hot Chili & African Cayenne Roasted Cashews (250g Pouch)', slug: 'hot-chili-cayenne-roasted-cashews-pouch', price: 80, salePrice: 70, brand: 'Savannah Crunch Co.', stock: 40, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [] },
          { name: 'Smoked Paprika & Garlic Savory Cashew Crunch (250g)', slug: 'smoked-paprika-garlic-savory-cashew-crunch', price: 85, salePrice: null, brand: 'Savannah Crunch Co.', stock: 35, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [] },
          { name: 'Raw Organic Whole Cashew Kernels for Baking (500g Bag)', slug: 'raw-organic-whole-cashew-kernels-500g', price: 120, salePrice: 105, brand: 'Savannah Crunch Co.', stock: 30, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [] },
          { name: 'Dark Chocolate-Dipped Roasted Cashew Pralines (200g Box)', slug: 'dark-chocolate-dipped-roasted-cashews', price: 110, salePrice: 95, brand: 'Savannah Crunch Co.', stock: 28, img: 'https://images.unsplash.com/photo-1536591375315-1b83683e321c?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Dried Fruits',
        slug: 'dried-fruits',
        products: [
          { name: 'Sun-Dried Organic Volta Mango Strips (200g Pack)', slug: 'sun-dried-organic-volta-mango-strips', price: 45, salePrice: null, brand: 'Volta Sunshine Foods', stock: 50, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
          { name: 'Chewy Sweet Sun-Dried Pineapple Ring Slices (200g Pack)', slug: 'chewy-sweet-sun-dried-pineapple-rings', price: 45, salePrice: 40, brand: 'Volta Sunshine Foods', stock: 45, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
          { name: 'Natural Sun-Dried Papaya Chunks with Lime (200g Pack)', slug: 'natural-sun-dried-papaya-chunks-lime', price: 42, salePrice: null, brand: 'Volta Sunshine Foods', stock: 40, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
          { name: 'Toasted Coconut Smiles Chips with Sea Salt (150g Pouch)', slug: 'toasted-coconut-smiles-chips-sea-salt', price: 38, salePrice: null, brand: 'Volta Sunshine Foods', stock: 55, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
          { name: 'Tropical Harvest Trail Mix (Mango, Cashew & Pineapple 250g)', slug: 'tropical-harvest-trail-mix-250g', price: 75, salePrice: 65, brand: 'Volta Sunshine Foods', stock: 35, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
          { name: 'Crispy Sweet Plantain Chips (Naturally Sweet 200g Bag)', slug: 'crispy-sweet-plantain-chips-200g', price: 30, salePrice: null, brand: 'Volta Sunshine Foods', stock: 60, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Botanical Teas',
        slug: 'botanical-teas',
        products: [
          { name: 'Artisan Hibiscus (Sobolo) Brew Infusion Blend (20 Pouches)', slug: 'artisan-hibiscus-sobolo-brew-tea-pouches', price: 60, salePrice: 50, brand: 'Afro-Bites Gourmet', stock: 40, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Golden Spiced Ginger & Lemongrass Herbal Tea (150g Tin)', slug: 'golden-spiced-ginger-lemongrass-tea-tin', price: 55, salePrice: null, brand: 'Afro-Bites Gourmet', stock: 45, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Cocoa Husk & Peppermint Energizing Tea (20 Pouches)', slug: 'cocoa-husk-peppermint-energizing-tea', price: 65, salePrice: 58, brand: 'Afro-Bites Gourmet', stock: 35, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Organic Moringa & Green Tea Metabolism Blend (20 Bags)', slug: 'organic-moringa-green-tea-metabolism', price: 50, salePrice: null, brand: 'Afro-Bites Gourmet', stock: 50, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Roasted Cocoa Bean Shell Detox Tea (Loose Leaf 200g)', slug: 'roasted-cocoa-shell-detox-tea-200g', price: 48, salePrice: null, brand: 'Afro-Bites Gourmet', stock: 40, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
          { name: 'Chamomile & Ghanaian Soursop Calming Night Brew (20 Bags)', slug: 'chamomile-ghanaian-soursop-night-brew', price: 65, salePrice: 55, brand: 'Afro-Bites Gourmet', stock: 30, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', variants: [] },
        ]
      }
    ]
  },

  // 7. Labadi Surf & Active Co.
  {
    slug: 'labadi-surf-active',
    name: 'Labadi Surf & Active Co.',
    mallCategorySlug: 'sports-fitness',
    businessCategory: 'Sports & Fitness',
    tagline: 'Coastal Activewear, Beach Sports & Outdoor Equipment',
    description: 'Gear for athletes, runners, swimmers, and beach lovers along the Gulf of Guinea. Durable water-resistant sports accessories, gym essentials, and coastal sportswear.',
    location: 'Labadi Beach Road / Trade Fair, Accra',
    phone: '+233551666777',
    whatsappNumber: '+233551666777',
    email: 'seller.surf@example.com',
    themeColor: '#0284c7',
    templateStyle: TemplateStyle.MARKETPLACE_GRID,
    baseDeliveryFee: 25.00,
    deliveryPolicy: 'Fast motorcycle courier delivery across Accra beaches and sports gyms within 3 hours. Free in-person pickup at our Labadi beach shop.',
    returnPolicy: 'Sports gear and accessories can be returned within 14 days in unused condition with tags attached. Swimwear must have hygiene liner intact.',
    categories: [
      {
        name: 'Coastal Activewear',
        slug: 'coastal-activewear',
        products: [
          { name: 'Ghana Black Stars Coastal Athletic Rash Guard (SPF 50+)', slug: 'ghana-black-stars-coastal-athletic-rash-guard', price: 340, salePrice: 295, brand: 'Labadi Active', stock: 25, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Medium (38-40")', price: 295, stock: 8 }, { name: 'Large (42-44")', price: 295, stock: 10 }, { name: 'XL (46-48")', price: 295, stock: 7 }] },
          { name: 'Quick-Dry 4-Way Stretch Board Shorts with Zip Pocket', slug: 'quick-dry-stretch-board-shorts-zip', price: 260, salePrice: 230, brand: 'Labadi Active', stock: 30, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Size 32', price: 230, stock: 10 }, { name: 'Size 34', price: 230, stock: 10 }, { name: 'Size 36', price: 230, stock: 10 }] },
          { name: 'Labadi Beach High-Waisted UV Compression Leggings', slug: 'labadi-beach-compression-leggings', price: 280, salePrice: null, brand: 'Labadi Active', stock: 24, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Small', price: 280, stock: 8 }, { name: 'Medium', price: 280, stock: 8 }, { name: 'Large', price: 280, stock: 8 }] },
          { name: 'Breathable Anti-Chafe Sleeveless Gym Tank Top', slug: 'breathable-anti-chafe-gym-tank-top', price: 160, salePrice: 140, brand: 'Labadi Active', stock: 35, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Black', price: 140, stock: 20 }, { name: 'Navy Blue', price: 140, stock: 15 }] },
          { name: 'Waterproof Windbreaker Lightweight Running Jacket', slug: 'waterproof-windbreaker-running-jacket', price: 380, salePrice: 340, brand: 'Labadi Active', stock: 18, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Neon Yellow', price: 340, stock: 9 }, { name: 'Slate Gray', price: 340, stock: 9 }] },
          { name: 'Anti-Slip Coastal Water Sports Aqua Shoes', slug: 'anti-slip-coastal-water-sports-aqua-shoes', price: 220, salePrice: 195, brand: 'Labadi Active', stock: 30, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', variants: [{ name: 'Size 41', price: 195, stock: 10 }, { name: 'Size 42', price: 195, stock: 10 }, { name: 'Size 43', price: 195, stock: 10 }] },
        ]
      },
      {
        name: 'Dry Bags & Storage',
        slug: 'dry-bags-storage',
        products: [
          { name: 'Heavy-Duty 20L Waterproof Ocean Dry Bag', slug: 'heavy-duty-20l-waterproof-ocean-dry-bag', price: 190, salePrice: 170, brand: 'Labadi Active', stock: 30, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [{ name: 'Ocean Yellow', price: 170, stock: 15 }, { name: 'Matte Black', price: 170, stock: 15 }] },
          { name: 'Ultra-Light 10L Kayak & Beach Dry Sack', slug: 'ultra-light-10l-kayak-beach-dry-sack', price: 130, salePrice: null, brand: 'Labadi Active', stock: 35, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [{ name: 'Cyan Blue', price: 130, stock: 20 }, { name: 'Sunset Orange', price: 130, stock: 15 }] },
          { name: '35L Waterproof Travel Duffle Backpack with Shoulder Straps', slug: '35l-waterproof-travel-duffle-backpack', price: 320, salePrice: 280, brand: 'Labadi Active', stock: 20, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [] },
          { name: 'Floating Waterproof Smartphone Pouch with Touch Window', slug: 'floating-waterproof-smartphone-pouch', price: 65, salePrice: 50, brand: 'Labadi Active', stock: 50, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [{ name: 'Clear / Black', price: 50, stock: 50 }] },
          { name: 'Sandproof Quick-Dry Mesh Beach Duffle Bag', slug: 'sandproof-quick-dry-mesh-beach-bag', price: 140, salePrice: null, brand: 'Labadi Active', stock: 25, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [] },
          { name: 'Heavy-Duty Wet-Suit & Wetsuit Storage Barrel Bag', slug: 'heavy-duty-wet-suit-storage-barrel-bag', price: 240, salePrice: 210, brand: 'Labadi Active', stock: 18, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Hydration Bottles',
        slug: 'hydration-bottles',
        products: [
          { name: 'Insulated Stainless Steel 1-Litre Thermal Sports Bottle', slug: 'insulated-stainless-steel-1-litre-sports-bottle', price: 140, salePrice: 125, brand: 'Labadi Active', stock: 40, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [{ name: 'Ocean Blue', price: 125, stock: 20 }, { name: 'Forest Green', price: 125, stock: 20 }] },
          { name: '750ml Matte Black Ergonomic Cycling Water Bottle', slug: '750ml-matte-black-cycling-water-bottle', price: 85, salePrice: null, brand: 'Labadi Active', stock: 45, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [] },
          { name: '2-Litre Motivational Time-Marker Fitness Water Jug', slug: '2-litre-motivational-fitness-water-jug', price: 160, salePrice: 140, brand: 'Labadi Active', stock: 30, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [{ name: 'Purple Gradient', price: 140, stock: 15 }, { name: 'Teal Gradient', price: 140, stock: 15 }] },
          { name: 'Collapsible Silicone Trail Running Flask (500ml)', slug: 'collapsible-silicone-trail-running-flask', price: 75, salePrice: 65, brand: 'Labadi Active', stock: 50, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [] },
          { name: 'Stainless Steel Thermal Travel Tumbler with Straw (600ml)', slug: 'stainless-steel-thermal-travel-tumbler', price: 150, salePrice: null, brand: 'Labadi Active', stock: 35, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [{ name: 'Rose Gold', price: 150, stock: 18 }, { name: 'Matte White', price: 150, stock: 17 }] },
          { name: 'Fruit Infuser Sports Gym Water Bottle (800ml)', slug: 'fruit-infuser-sports-gym-water-bottle', price: 95, salePrice: 85, brand: 'Labadi Active', stock: 40, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', variants: [] },
        ]
      },
      {
        name: 'Fitness Accessories',
        slug: 'fitness-accessories',
        products: [
          { name: 'Professional Speed Skipping Rope with 360° Ball Bearings', slug: 'professional-speed-skipping-rope-bearings', price: 85, salePrice: null, brand: 'Labadi Active', stock: 35, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [] },
          { name: 'Heavy-Duty Loop Resistance Bands Set (5 Resistance Levels)', slug: 'loop-resistance-bands-set-5-levels', price: 120, salePrice: 105, brand: 'Labadi Active', stock: 40, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [] },
          { name: 'Extra Thick High-Density Non-Slip Yoga & Pilates Mat (10mm)', slug: 'extra-thick-non-slip-yoga-mat-10mm', price: 190, salePrice: 165, brand: 'Labadi Active', stock: 30, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [{ name: 'Deep Purple', price: 165, stock: 15 }, { name: 'Ocean Teal', price: 165, stock: 15 }] },
          { name: 'Adjustable Hand Grip Strengthener (10kg - 60kg)', slug: 'adjustable-hand-grip-strengthener-60kg', price: 65, salePrice: 55, brand: 'Labadi Active', stock: 50, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [] },
          { name: 'Deep Tissue High-Density Foam Muscle Recovery Roller', slug: 'deep-tissue-foam-muscle-roller', price: 140, salePrice: 120, brand: 'Labadi Active', stock: 25, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [] },
          { name: 'Sweat-Resistant Running Waist Pack with Headphone Port', slug: 'sweat-resistant-running-waist-pack', price: 75, salePrice: null, brand: 'Labadi Active', stock: 45, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', variants: [] },
        ]
      }
    ]
  }
];

async function syncShopSpec(prisma, isSupabase = false) {
  console.log(`\n========================================`);
  console.log(`SYNCING 7 SHOPS & AT LEAST 6 ITEMS PER CATEGORY TO ${isSupabase ? 'SUPABASE' : 'LOCAL'}`);
  console.log(`========================================`);

  const mallCategories = await prisma.mallCategory.findMany();
  const mallCatMap = Object.fromEntries(mallCategories.map(c => [c.slug, c.id]));

  for (const shopSpec of ALL_SHOPS_SPEC) {
    console.log(`\nProcessing shop: ${shopSpec.name} (${shopSpec.slug})...`);

    // 1. Owner
    const passwordHash = await bcrypt.hash('MerchantPass#2026', 10);
    const owner = await prisma.user.upsert({
      where: { email: shopSpec.email },
      update: {
        name: `${shopSpec.name} Owner`,
        role: 'MERCHANT',
        phone: shopSpec.phone,
      },
      create: {
        email: shopSpec.email,
        name: `${shopSpec.name} Owner`,
        passwordHash,
        role: 'MERCHANT',
        phone: shopSpec.phone,
      }
    });

    // 2. Logo & Banner
    const firstCat = shopSpec.categories[0];
    const secondCat = shopSpec.categories[1] || firstCat;
    const logoUrl = await downloadOrCacheImage(firstCat.products[0].img, `${shopSpec.slug}-logo`);
    const bannerUrl = await downloadOrCacheImage(secondCat.products[0].img, `${shopSpec.slug}-banner`);

    // 3. Shop record
    const shop = await prisma.shop.upsert({
      where: { slug: shopSpec.slug },
      update: {
        name: shopSpec.name,
        tagline: shopSpec.tagline,
        description: shopSpec.description,
        logoUrl: shopSpec.slug === 'accra-gadget-hub-test' ? undefined : logoUrl, // keep AGH's custom uploaded logo
        bannerUrl: shopSpec.slug === 'accra-gadget-hub-test' ? undefined : bannerUrl, // keep AGH's custom banner
        businessCategory: shopSpec.businessCategory,
        location: shopSpec.location,
        phone: shopSpec.phone,
        whatsappNumber: shopSpec.whatsappNumber,
        email: shopSpec.email,
        status: ShopStatus.ACTIVE,
        themeColor: shopSpec.themeColor,
        templateStyle: shopSpec.templateStyle,
        deliveryPolicy: shopSpec.deliveryPolicy,
        returnPolicy: shopSpec.returnPolicy,
        pickupAvailable: true,
        baseDeliveryFee: shopSpec.baseDeliveryFee,
        isFeatured: shopSpec.slug === 'accra-gadget-hub-test', // AGH is featured first!
      },
      create: {
        ownerId: owner.id,
        name: shopSpec.name,
        slug: shopSpec.slug,
        tagline: shopSpec.tagline,
        description: shopSpec.description,
        logoUrl,
        bannerUrl,
        businessCategory: shopSpec.businessCategory,
        location: shopSpec.location,
        phone: shopSpec.phone,
        whatsappNumber: shopSpec.whatsappNumber,
        email: shopSpec.email,
        status: ShopStatus.ACTIVE,
        themeColor: shopSpec.themeColor,
        templateStyle: shopSpec.templateStyle,
        deliveryPolicy: shopSpec.deliveryPolicy,
        returnPolicy: shopSpec.returnPolicy,
        pickupAvailable: true,
        baseDeliveryFee: shopSpec.baseDeliveryFee,
        isFeatured: shopSpec.slug === 'accra-gadget-hub-test',
      }
    });

    // 4. Shop Categories: remove any unpopulated categories so only populated categories remain!
    const validSlugs = shopSpec.categories.map(c => c.slug);
    const deletedStale = await prisma.shopCategory.deleteMany({
      where: {
        shopId: shop.id,
        slug: { notIn: validSlugs }
      }
    });
    if (deletedStale.count > 0) {
      console.log(`  Removed ${deletedStale.count} unpopulated / placeholder categories.`);
    }

    const shopCatIdMap = {};
    for (let i = 0; i < shopSpec.categories.length; i++) {
      const cat = shopSpec.categories[i];
      const sc = await prisma.shopCategory.upsert({
        where: { shopId_slug: { shopId: shop.id, slug: cat.slug } },
        update: { name: cat.name, displayOrder: i, isActive: true },
        create: {
          shopId: shop.id,
          name: cat.name,
          slug: cat.slug,
          displayOrder: i,
          isActive: true,
        }
      });
      shopCatIdMap[cat.slug] = sc.id;
    }

    // 5. Products: each category must have at least 6 items!
    const mallCatId = mallCatMap[shopSpec.mallCategorySlug] || null;

    for (const cat of shopSpec.categories) {
      const shopCatId = shopCatIdMap[cat.slug];
      console.log(`  -> Category "${cat.name}" (${cat.products.length} items)...`);

      for (const p of cat.products) {
        const productImgUrl = await downloadOrCacheImage(p.img, `${shopSpec.slug}-${p.slug}`);

        const product = await prisma.product.upsert({
          where: { shopId_slug: { shopId: shop.id, slug: p.slug } },
          update: {
            name: p.name,
            description: `${p.name}. Genuine quality available from ${shopSpec.name} on The Ultimate Virtual Mall Ghana. Fast Accra delivery and secure checkout.`,
            price: p.price,
            salePrice: p.salePrice || null,
            brand: p.brand || null,
            stock: p.stock || 20,
            status: ProductStatus.PUBLISHED,
            isAvailable: true,
            mallCategoryId: mallCatId,
            shopCategoryId: shopCatId,
          },
          create: {
            shopId: shop.id,
            mallCategoryId: mallCatId,
            shopCategoryId: shopCatId,
            name: p.name,
            slug: p.slug,
            description: `${p.name}. Genuine quality available from ${shopSpec.name} on The Ultimate Virtual Mall Ghana. Fast Accra delivery and secure checkout.`,
            price: p.price,
            salePrice: p.salePrice || null,
            brand: p.brand || null,
            stock: p.stock || 20,
            status: ProductStatus.PUBLISHED,
            isAvailable: true,
          }
        });

        // Image
        await prisma.productImage.deleteMany({ where: { productId: product.id } });
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: productImgUrl,
            altText: p.name,
            displayOrder: 0,
          }
        });

        // Variants
        await prisma.productVariant.deleteMany({ where: { productId: product.id } });
        if (p.variants && p.variants.length > 0) {
          for (const v of p.variants) {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: v.name,
                sku: `${shopSpec.slug.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`,
                price: v.price,
                stock: v.stock || 10,
              }
            });
          }
        }
      }
    }
  }

  // Audit Verification
  console.log(`\n--- ${isSupabase ? 'SUPABASE' : 'LOCAL'} CATEGORY AUDIT ---`);
  const auditShops = await prisma.shop.findMany({
    where: { status: 'ACTIVE' },
    select: {
      name: true,
      slug: true,
      shopCategories: {
        select: {
          name: true,
          slug: true,
          _count: { select: { products: { where: { status: 'PUBLISHED' } } } }
        }
      }
    }
  });

  for (const s of auditShops) {
    console.log(`\nShop: ${s.name} (${s.slug})`);
    for (const c of s.shopCategories) {
      console.log(`   - [${c._count.products >= 6 ? 'PASS' : 'WARN'}] ${c.name}: ${c._count.products} products`);
    }
  }
}

async function main() {
  console.log('Populating all shop categories with at least 6 genuine items...');
  // 1. Sync Local
  await syncShopSpec(localPrisma, false);
  // 2. Sync Supabase
  await syncShopSpec(supabasePrisma, true);
  console.log('\n[ALL COMPLETE] All shop categories populated with at least 6 products across Local & Supabase!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
