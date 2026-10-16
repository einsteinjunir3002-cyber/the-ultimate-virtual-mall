import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const LOCAL_URL = 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public';
const SUPABASE_URL = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

// Ensure all uploads exist
const UPLOAD_DIR = path.resolve('public/uploads');

// Catalog definition with 100% verified matching images, names, descriptions, and specifications
const CATALOG = [
  // ==========================================
  // 1. ACCRA GADGET HUB (TEST)
  // ==========================================
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    slug: 'apple-iphone-15-pro-max-256gb',
    price: 18500,
    salePrice: 17800,
    image: '/uploads/prod-uniq-1695048133142-1a20484d2569.webp',
    description: `The pinnacle of Apple smartphone engineering in aerospace-grade Natural Titanium. Powered by the A17 Pro chip with 6-core GPU, bringing console-level gaming to mobile. Features the innovative Action button and the most powerful iPhone camera system ever with 5x optical zoom.\n\nSPECIFICATIONS:\n- Display: 6.7" Super Retina XDR OLED with ProMotion 120Hz & Always-On (2796 x 1290 at 460 ppi)\n- Processor: Apple A17 Pro (3nm architecture, 6-core CPU, 6-core GPU)\n- Storage: 256GB NVMe\n- Camera System: 48MP Main with sensor-shift OIS, 12MP Ultra Wide (120° FOV), 12MP 5x Telephoto (120mm focal length)\n- Build: Grade 5 Titanium frame with Ceramic Shield front and textured matte glass back\n- Battery & Charging: Up to 29 hours video playback, USB-C (USB 3 speeds up to 10Gb/s), 15W MagSafe\n- Durability: IP68 water/dust resistance (6m for up to 30 mins)\n- Warranty: 1-Year Official Apple Warranty with Accra Gadget Hub support`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    price: 17200,
    salePrice: 16500,
    image: '/uploads/prod-uniq-1610945265064-0e34e5519bbf.webp',
    description: `Samsung's flagship smartphone built with Galaxy AI intelligence and a durable titanium shield. Features a completely flat 6.8" Dynamic AMOLED 2X display with Corning Gorilla Armor, integrated S Pen stylus, and revolutionary quad telephoto camera system with 100x Space Zoom.\n\nSPECIFICATIONS:\n- Display: 6.8" QHD+ Dynamic AMOLED 2X flat screen, 1-120Hz adaptive refresh rate, 2,600 nits peak brightness\n- Processor: Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)\n- Memory & Storage: 12GB LPDDR5X RAM, 512GB UFS 4.0 Storage\n- Cameras: 200MP Wide OIS, 50MP 5x Periscope OIS, 10MP 3x Telephoto OIS, 12MP Ultra-Wide\n- S Pen: Built-in Bluetooth stylus with 2.8ms latency & air gestures\n- Battery & Charging: 5,000mAh, 45W wired fast charging, 15W Fast Wireless Charging 2.0\n- OS & Updates: Android 14 with One UI 6.1 (7 years of guaranteed OS & security updates)\n- Warranty: 2-Year Samsung Ghana official warranty`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Apple iPhone 14 Pro 128GB Deep Purple',
    slug: 'apple-iphone-14-pro-128gb',
    price: 13900,
    salePrice: 13200,
    image: '/uploads/prod-uniq-1663499482523-1c0c1bae4ce1.webp',
    description: `Apple iPhone 14 Pro introducing Dynamic Island—a magical new way to interact with activities, alerts, and music. Powered by the A16 Bionic chip with a 48MP camera sensor for unbelievable detail in ProRAW format.\n\nSPECIFICATIONS:\n- Display: 6.1" Super Retina XDR OLED with Dynamic Island & Always-On Display (2000 nits peak outdoors)\n- Chip: Apple A16 Bionic (6-core CPU, 5-core GPU, 16-core Neural Engine)\n- Storage: 128GB NVMe\n- Cameras: 48MP Main f/1.78, 12MP Ultra-Wide, 12MP 3x Telephoto, Photonic Engine & Action Mode\n- Safety: Emergency SOS via satellite & Crash Detection\n- Construction: Surgical-grade stainless steel with Ceramic Shield glass\n- Warranty: 1-Year Apple Manufacturer Warranty`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Google Pixel 8 Pro 256GB Obsidian',
    slug: 'google-pixel-8-pro-256gb',
    price: 12800,
    salePrice: 11999,
    image: '/uploads/prod-uniq-1598327105666-5b89351aff97.webp',
    description: `Google's ultimate AI smartphone powered by Google Tensor G3. Features the Super Actua display, custom temperature sensor, and Google's industry-leading computational photography with Best Take, Magic Editor, and Audio Magic Eraser.\n\nSPECIFICATIONS:\n- Display: 6.7" Super Actua LTPO OLED (1344 x 2992), 1-120Hz, 2,400 nits peak brightness, Gorilla Glass Victus 2\n- Processor: Google Tensor G3 with Titan M2 security coprocessor\n- Memory & Storage: 12GB LPDDR5X RAM, 256GB UFS 3.1\n- Cameras: 50MP Octa PD Main with OIS, 48MP Quad PD Ultra-Wide with Macro Focus, 48MP Quad PD 5x Telephoto (up to 30x Super Res Zoom)\n- Battery: 5,050mAh with 30W fast charging & Extreme Battery Saver up to 72 hours\n- Updates: 7 years of full Android OS, security, and Feature Drop updates`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Apple iPhone 13 Pro 128GB Sierra Blue',
    slug: 'apple-iphone-13-pro-128gb-blue',
    price: 9800,
    salePrice: 9400,
    image: '/uploads/prod-iphone-13-pro.webp',
    description: `A celebrated iPhone classic in stunning Sierra Blue with surgical-grade stainless steel band. Features a 120Hz ProMotion Super Retina XDR display, cinematic mode in 1080p at 30 fps, and macro photography down to 2cm.\n\nSPECIFICATIONS:\n- Display: 6.1" Super Retina XDR OLED with ProMotion adaptive 120Hz\n- Processor: Apple A15 Bionic (6-core CPU, 5-core GPU)\n- Storage: 128GB NVMe\n- Cameras: Triple 12MP system (Telephoto, Wide, and Ultra Wide) with LiDAR Scanner for Night Mode portraits\n- Video: ProRes video recording up to 4K at 30 fps, Dolby Vision HDR recording\n- Battery: All-day battery life with MagSafe and Qi wireless charging`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Samsung Galaxy Z Fold 5 256GB Phantom Black',
    slug: 'samsung-galaxy-z-fold-5-256gb',
    price: 19500,
    salePrice: 18800,
    image: '/uploads/prod-uniq-1580910051074-3eb694886505.webp',
    description: `The definitive foldable phone engineered with a zero-gap Flex Hinge that closes completely flat. Unfolds into a massive 7.6" Dynamic AMOLED 2X tablet screen for PC-like multitasking with multi-window support and S Pen Fold Edition compatibility.\n\nSPECIFICATIONS:\n- Main Screen: 7.6" QXGA+ Dynamic AMOLED 2X foldable display (2176 x 1812), 1-120Hz\n- Cover Screen: 6.2" Dynamic AMOLED 2X (2316 x 904), 48-120Hz\n- Processor: Snapdragon 8 Gen 2 Mobile Platform for Galaxy (4nm)\n- Memory & Storage: 12GB RAM, 256GB Storage\n- Cameras: 50MP Main OIS, 12MP Ultra-Wide, 10MP 3x Telephoto, 4MP Under-Display Camera\n- Durability: Armor Aluminum frame, IPX8 water resistance, Gorilla Glass Victus 2 on cover and back\n- Battery: 4,400mAh dual battery with 25W fast charging`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'iPhone 13 Pro 256GB Graphite',
    slug: 'iphone-13-pro-graphite',
    price: 10400,
    salePrice: 9900,
    image: '/uploads/img-1792081927876-1xeqih.webp',
    description: `Apple iPhone 13 Pro in sleek Graphite. Features the revolutionary A15 Bionic chip with 5-core GPU, ProMotion 120Hz display, and 256GB storage capacity for storing high-bitrate ProRes video and thousands of 4K photos.\n\nSPECIFICATIONS:\n- Display: 6.1-inch Super Retina XDR display with ProMotion\n- Storage: 256GB NVMe\n- Cameras: Triple 12MP cameras with 3x optical zoom range\n- Build: Surgical-grade stainless steel with textured matte glass\n- Condition: Brand New In Box, Factory Unlocked`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Apple iPhone 6 64GB Space Gray (Collector Edition)',
    slug: 'apple-iphone-6-64gb',
    price: 1800,
    salePrice: 1500,
    image: '/uploads/img-1792081927812-3m9f6k.webp',
    description: `The iconic smartphone that redefined thinness and unibody aluminum design. Sealed collector unit featuring the 4.7" Retina HD display, Apple A8 64-bit desktop-class chip, and Touch ID biometric fingerprint scanner.\n\nSPECIFICATIONS:\n- Display: 4.7" Retina HD display (1334 x 750 pixels)\n- Chipset: Apple A8 with M8 motion coprocessor\n- Storage: 64GB\n- Camera: 8MP iSight camera with Focus Pixels and True Tone flash\n- Biometrics: Touch ID fingerprint sensor built into the Home button`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'smartphones',
    name: 'Apple iPhone 5s 32GB Silver (Vintage Edition)',
    slug: 'apple-iphone-5s-32gb',
    price: 1200,
    salePrice: 950,
    image: '/uploads/img-1792081927736-x9lg4x.webp',
    description: `A milestone in computing history: the world's very first 64-bit smartphone. Crafted from precision aluminum and sapphire crystal with diamond-cut chamfered edges, introducing Touch ID to the world.\n\nSPECIFICATIONS:\n- Display: 4.0" Retina display (1136 x 640)\n- Processor: Apple A7 chip with 64-bit architecture\n- Storage: 32GB\n- Camera: 8MP iSight camera with f/2.2 aperture and sapphire crystal lens cover\n- Dimensions: 123.8 x 58.6 x 7.6 mm (Weight: 112 grams)`
  },

  // LAPTOPS (9 items)
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Apple MacBook Pro 14" M3 Pro Space Black',
    slug: 'apple-macbook-pro-14-m3-pro',
    price: 28500,
    salePrice: 27900,
    image: '/uploads/prod-uniq-1517336714731-489689fd1ca8.webp',
    description: `Pro performance unleashed. Powered by the breakthrough Apple M3 Pro chip with an advanced 3nm architecture. Features the stunning Liquid Retina XDR display with 1,600 nits peak HDR brightness and an anodization seal that dramatically reduces fingerprints in Space Black.\n\nSPECIFICATIONS:\n- Display: 14.2" Liquid Retina XDR display (3024 x 1964), 1,000,000:1 contrast, 120Hz ProMotion\n- Processor: Apple M3 Pro (11-core CPU with 5 performance and 6 efficiency cores, 14-core GPU, Hardware-accelerated ray tracing)\n- Memory & Storage: 18GB Unified Memory, 512GB SSD (up to 7.4GB/s read speeds)\n- Ports: 3x Thunderbolt 4 (USB-C), HDMI port with 8K output, SDXC card slot, MagSafe 3\n- Battery Life: Up to 18 hours Apple TV app movie playback / 12 hours wireless web\n- Audio: High-fidelity six-speaker sound system with force-cancelling woofers & spatial audio`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Dell XPS 15 9530 Core i9 32GB OLED Touch',
    slug: 'dell-xps-15-9530-core-i9',
    price: 31000,
    salePrice: 29500,
    image: '/uploads/prod-uniq-1593642632823-8f785ba67e45.webp',
    description: `The premier creative powerhouse laptop. Features a breathtaking 3.5K OLED InfinityEdge touchscreen, CNC machined aluminum chassis with carbon fiber palm rest, 13th Gen Intel Core i9-13900H, and NVIDIA GeForce RTX 4070 studio graphics.\n\nSPECIFICATIONS:\n- Display: 15.6" 3.5K (3456 x 2160) OLED InfinityEdge Touch Display, 400 nits, 100% DCI-P3\n- Processor: 13th Gen Intel Core i9-13900H (14 cores, 20 threads, up to 5.4GHz Turbo)\n- Graphics: NVIDIA GeForce RTX 4070 8GB GDDR6 (40W TGP)\n- RAM: 32GB Dual-Channel DDR5 4800MHz (expandable to 64GB)\n- Storage: 1TB M.2 PCIe NVMe Gen 4 SSD\n- Audio: Waves Nx 3D audio quad-speaker design (2 woofers + 2 tweeters, 8W total output)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Apple MacBook Air 15" M2 16GB Starlight',
    slug: 'apple-macbook-air-15-m2-16gb',
    price: 21500,
    salePrice: 20400,
    image: '/uploads/prod-uniq-1611186871348-b1ce696e52c9.webp',
    description: `Impossibly thin at just 11.5mm, the 15-inch MacBook Air gives you more room for what you love with an expansive Liquid Retina display. Fanless silent design with incredible 18-hour battery life powered by Apple M2.\n\nSPECIFICATIONS:\n- Display: 15.3" Liquid Retina display with True Tone (2880 x 1864 at 224 ppi), 500 nits brightness\n- Processor: Apple M2 (8-core CPU, 10-core GPU, 16-core Neural Engine)\n- Memory & Storage: 16GB Unified Memory, 512GB SSD\n- Keyboard & Trackpad: Backlit Magic Keyboard with Touch ID, Force Touch trackpad\n- Webcam: 1080p FaceTime HD camera with advanced image signal processor\n- Weight: 1.51 kg (3.3 pounds)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'HP Spectre x360 14" 2-in-1 Nightfall Black',
    slug: 'hp-spectre-x360-14-oled',
    price: 19800,
    salePrice: 18900,
    image: '/uploads/prod-uniq-1544716278-ca5e3f4abd8c.webp',
    description: `A gem-cut masterpiece 2-in-1 convertible laptop. 360-degree geared hinge lets you switch seamlessly between laptop, tent, stand, and tablet modes. Features 2.8K OLED touch display with HP Tilt Pen included.\n\nSPECIFICATIONS:\n- Display: 13.5" 3K2K (3000 x 2000) OLED multitouch 3:2 aspect ratio, 500 nits HDR\n- Processor: Intel Core i7-1355U (10 cores, up to 5.0 GHz with Intel Turbo Boost)\n- Memory & Storage: 16GB LPDDR4x-4266 MHz RAM, 1TB PCIe Gen4 NVMe M.2 SSD\n- Audio: Bang & Olufsen quad speakers with HP Audio Boost\n- Security: IR facial recognition camera with physical camera privacy shutter & fingerprint sensor`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11 Core i7',
    slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    price: 24500,
    salePrice: 23200,
    image: '/uploads/prod-uniq-1588872657578-7efd1f1555ed.webp',
    description: `The gold standard of executive enterprise ultrabooks. Built with a carbon-fiber top cover and magnesium alloy chassis tested against 12 MIL-STD 810H military-grade requirements. Weighs under 1.12kg with legendary spill-resistant keyboard.\n\nSPECIFICATIONS:\n- Display: 14" WUXGA (1920 x 1200) IPS anti-glare, 400 nits, 100% sRGB, Eyesafe certified\n- Processor: Intel Core i7-1365U vPro (10 cores, 12 threads, up to 5.2GHz)\n- Memory: 16GB LPDDR5-6400MHz soldered memory\n- Storage: 512GB SSD M.2 2280 PCIe Gen4 Performance NVMe Opal 2.0\n- Connectivity: Wi-Fi 6E, Bluetooth 5.1, 2x Thunderbolt 4 / USB4 40Gbps, 2x USB-A 3.2 Gen 1, HDMI 2.1\n- Biometrics: Fingerprint reader integrated into power button & Glance presence detection`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Asus Zenbook Duo OLED Dual Screen Core Ultra 9',
    slug: 'asus-zenbook-duo-oled-dual-screen',
    price: 29800,
    salePrice: 28500,
    image: '/uploads/prod-uniq-1525547719571-a2d4ac8945e2.webp',
    description: `Dual full-size 14" 3K 120Hz Lumina OLED touchscreens that transform your workspace into a 19.8-inch giant visual canvas. Includes detachable Bluetooth keyboard with integrated trackpad and built-in kickstand.\n\nSPECIFICATIONS:\n- Displays: Dual 14.0" 3K (2880 x 1800) OLED 16:10 touchscreens, 120Hz refresh, 500 nits, 100% DCI-P3\n- Processor: Intel Core Ultra 9 185H (16 cores, 22 threads, Intel AI Boost NPU)\n- Memory & Storage: 32GB LPDDR5X RAM, 1TB M.2 NVMe PCIe 4.0 SSD\n- Battery: 75Wh battery providing up to 13.5 hours on single screen, 10.5 hours on dual screen\n- Modes: Dual Screen Mode, Desktop Mode, Laptop Mode with physical keyboard, Sharing Mode (180° lay-flat)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Apple MacBook Pro 14 Inch Space Grey M1 Pro',
    slug: 'apple-macbook-pro-14-m1-pro',
    price: 18500,
    salePrice: 17500,
    image: '/uploads/img-1792081927931-tqdz7z.webp',
    description: `The groundbreaking M1 Pro MacBook Pro 14" in pristine Space Grey. Engineered for developers, videographers, and audio engineers with hardware ProRes acceleration.\n\nSPECIFICATIONS:\n- Chip: Apple M1 Pro (8-core CPU, 14-core GPU)\n- Memory: 16GB Unified RAM\n- Storage: 512GB High-Speed NVMe SSD\n- Screen: 14.2" Liquid Retina XDR with Mini-LED technology`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Asus Zenbook Pro Dual Screen Laptop',
    slug: 'asus-zenbook-pro-dual-screen',
    price: 22000,
    salePrice: 20900,
    image: '/uploads/img-1792081927992-yutqrs.webp',
    description: `Asus Zenbook Pro Duo featuring ScreenPad Plus tilting secondary touchscreen. Engineered for video editors and music producers requiring timeline expansion.\n\nSPECIFICATIONS:\n- Display: 15.6" 4K OLED main display + 14" 4K ScreenPad Plus\n- Processor: Intel Core i7 12th Gen 14-core\n- RAM & Storage: 16GB DDR5, 1TB SSD\n- Dedicated GPU: NVIDIA GeForce RTX 3060`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'laptops',
    name: 'Huawei Matebook X Pro Emerald Green',
    slug: 'huawei-matebook-x-pro',
    price: 16500,
    salePrice: 15400,
    image: '/uploads/img-1792081928055-aspkpe.webp',
    description: `Ultra-slim premium flagship laptop with skin-soothing metallic CNC body in Emerald Green. Features a 3.1K Real Color FullView touch display with 92.5% screen-to-body ratio.\n\nSPECIFICATIONS:\n- Display: 14.2" 3.1K (3120 x 2080) LTPS touchscreen, 90Hz, 500 nits\n- Processor: Intel Core i7 12th Gen\n- Memory & Storage: 16GB LPDDR5, 1TB PCIe NVMe SSD\n- Weight: 1.26 kg`
  },

  // TABLETS (9 items)
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Apple iPad Pro 12.9" M2 256GB WiFi Space Grey',
    slug: 'apple-ipad-pro-12-9-m2',
    price: 17800,
    salePrice: 16900,
    image: '/uploads/prod-uniq-1544244015-0df4b3ffc6b0.webp',
    description: `The ultimate iPad experience powered by Apple M2. Featuring the sensational Liquid Retina XDR display with 10,000 mini-LEDs, Apple Pencil hover feature, and Thunderbolt connectivity for external 6K displays.\n\nSPECIFICATIONS:\n- Display: 12.9" Liquid Retina XDR Mini-LED (2732 x 2048), 1,000 nits full-screen / 1,600 nits peak HDR\n- Processor: Apple M2 (8-core CPU, 10-core GPU, 16-core Neural Engine)\n- Storage: 256GB\n- Apple Pencil: Supports 2nd Gen Apple Pencil with 12mm Hover detection\n- Cameras: 12MP Wide + 10MP Ultra-Wide with LiDAR Scanner & 12MP TrueDepth Ultra Wide front camera with Center Stage\n- Audio: Four speaker audio system with studio-quality five-mic array`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Apple iPad Air 5th Gen 64GB Blue (M1)',
    slug: 'apple-ipad-air-5th-gen-blue',
    price: 9400,
    salePrice: 8900,
    image: '/uploads/prod-uniq-1561154464-82e9adf32764.webp',
    description: `Light. Bright. Full of might. The iPad Air supercharged by the Apple M1 chip with 8-core CPU that delivers up to 60% faster performance. Features a 10.9" Liquid Retina display and Touch ID built into the top button.\n\nSPECIFICATIONS:\n- Display: 10.9" Liquid Retina IPS LED-backlit (2360 x 1640), P3 wide color, True Tone\n- Chip: Apple M1 (8-core CPU, 8-core GPU)\n- Storage: 64GB\n- Camera: 12MP Ultra-Wide front camera with Center Stage & 12MP Wide back camera with 4K video\n- Accessories: Compatible with Magic Keyboard, Smart Keyboard Folio, and Apple Pencil (2nd gen)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Samsung Galaxy Tab S9 Ultra 5G 512GB with S Pen',
    slug: 'samsung-galaxy-tab-s9-ultra-5g',
    price: 21900,
    salePrice: 20800,
    image: '/uploads/prod-uniq-1585790050230-5dd28404ccb9.webp',
    description: `The grandest Android tablet ever built. Features an enormous 14.6" Dynamic AMOLED 2X screen with IP68 water resistance for both the tablet and included S Pen. Powered by Snapdragon 8 Gen 2 for Galaxy with Armor Aluminum frame.\n\nSPECIFICATIONS:\n- Display: 14.6" WQXGA+ Dynamic AMOLED 2X (2960 x 1848), 120Hz, HDR10+, Vision Booster\n- Processor: Snapdragon 8 Gen 2 for Galaxy (4nm)\n- Memory & Storage: 12GB RAM, 512GB UFS Storage (microSD expansion up to 1TB)\n- S Pen: Included bi-directional charging IP68 waterproof S Pen stylus (2.8ms latency)\n- Sound: Quad AKG tuned stereo speakers with Dolby Atmos\n- Battery: Massive 11,200mAh battery with 45W super fast charging`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Apple iPad Mini (2021) 64GB Purple',
    slug: 'apple-ipad-mini-2021-64gb',
    price: 7800,
    salePrice: 7300,
    image: '/uploads/prod-uniq-1541807084-5c52b6b3adef.webp',
    description: `Mega power in mini size. An all-screen design with an 8.3-inch Liquid Retina display that fits in the palm of your hand. Powered by the A15 Bionic chip with Neural Engine, USB-C connectivity, and 2nd Gen Apple Pencil support.\n\nSPECIFICATIONS:\n- Display: 8.3" Liquid Retina display with True Tone & P3 wide color (2266 x 1488)\n- Processor: Apple A15 Bionic with 6-core CPU and 5-core GPU\n- Storage: 64GB\n- Camera: 12MP Ultra-Wide front camera with Center Stage, 12MP Wide rear camera with True Tone flash\n- Weight: Only 293 grams`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Samsung Galaxy Tab S8 Plus 128GB Graphite',
    slug: 'samsung-galaxy-tab-s8-plus-128gb',
    price: 11500,
    salePrice: 10800,
    image: '/uploads/prod-uniq-1589739900243-4b52cd9b104e.webp',
    description: `Premium 12.4" productivity tablet featuring a Super AMOLED display at 120Hz, Samsung DeX desktop computing mode, and ultra-low latency S Pen included in the box.\n\nSPECIFICATIONS:\n- Display: 12.4" Super AMOLED (2800 x 1752), 120Hz refresh rate\n- Processor: Qualcomm Snapdragon 8 Gen 1\n- Memory & Storage: 8GB RAM, 128GB Storage (expandable via MicroSD)\n- Battery: 10,090mAh with 45W fast charging`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Lenovo Tab P12 Pro 256GB with Precision Pen 3',
    slug: 'lenovo-tab-p12-pro-256gb',
    price: 9900,
    salePrice: 9200,
    image: '/uploads/prod-uniq-1542751371-adc38448a05e.webp',
    description: `Flagship Android multimedia and productivity powerhouse. Boasts a 12.6" 2K AMOLED screen with Dolby Vision and 120Hz refresh, quad JBL speakers, and wireless magnetic charging for the included Precision Pen 3.\n\nSPECIFICATIONS:\n- Display: 12.6" 2K (2560 x 1600) AMOLED, 120Hz, HDR10+ and Dolby Vision, 600 nits\n- Processor: Qualcomm Snapdragon 870 5G Mobile Platform\n- Memory & Storage: 8GB LPDDR5 RAM, 256GB UFS 3.1\n- Battery: 10,200mAh with Quick Charge 4.0 (up to 45W)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'iPad Mini 2021 Starlight 256GB Cellular',
    slug: 'ipad-mini-2021-starlight',
    price: 9200,
    salePrice: 8600,
    image: '/uploads/img-1792081928254-sb9ooq.webp',
    description: `Apple iPad Mini 6th Generation in warm Starlight. Fully loaded with 256GB storage and Gigabit LTE Cellular connectivity for staying productive anywhere in Ghana.\n\nSPECIFICATIONS:\n- Display: 8.3-inch Liquid Retina display with True Tone\n- Connectivity: Wi-Fi 6 + 5G Cellular unlocked\n- Storage: 256GB NVMe\n- Chip: Apple A15 Bionic`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Samsung Galaxy Tab S8 Plus Grey 256GB',
    slug: 'samsung-galaxy-tab-s8-plus-grey',
    price: 12500,
    salePrice: 11800,
    image: '/uploads/img-1792081928312-rcd6ig.webp',
    description: `The 256GB high-capacity edition of the Galaxy Tab S8 Plus in sophisticated Grey. Features an in-display optical fingerprint scanner and wireless second screen functionality for Windows PCs.\n\nSPECIFICATIONS:\n- Display: 12.4" Super AMOLED 120Hz display\n- Storage: 256GB with 8GB RAM\n- S Pen: Included magnetic latency-reduced stylus`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'tablets',
    name: 'Samsung Galaxy Tab White 10.5" 64GB',
    slug: 'samsung-galaxy-tab-white',
    price: 4500,
    salePrice: 3999,
    image: '/uploads/img-1792081928380-5qi1rx.webp',
    description: `Family entertainment and study tablet in clean ceramic White. Slim metal body with quad stereo speakers tuned with Dolby Atmos sound.\n\nSPECIFICATIONS:\n- Display: 10.5" WUXGA (1920 x 1200) screen\n- RAM & Storage: 4GB RAM, 64GB Storage\n- Battery: 7,040mAh with 15W charging`
  },

  // AUDIO & ACCESSORIES (9 items)
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    price: 5200,
    salePrice: 4800,
    image: '/uploads/prod-uniq-1505740420928-5e560c06d30e.webp',
    description: `Industry-leading active noise cancellation powered by two processors and eight microphones. Features a custom 30mm carbon fiber driver unit, LDAC high-resolution audio support, and crystal clear hands-free calling with AI beamforming microphones.\n\nSPECIFICATIONS:\n- Drivers: 30mm precision-engineered carbon fiber composite dome\n- Noise Canceling: Dual Processor (Integrated Processor V1 + HD Noise Cancelling Processor QN1) with 8 microphones\n- Battery Life: 30 hours playback with ANC ON (up to 40 hours with ANC OFF)\n- Fast Charge: 3 minutes charge yields 3 hours playback\n- Codecs: LDAC, AAC, SBC (Hi-Res Audio Wireless certified)\n- Connectivity: Bluetooth 5.2 with Multipoint connection to two devices simultaneously`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Apple AirPods Pro (2nd Gen, USB-C) MagSafe',
    slug: 'apple-airpods-pro-2nd-gen-usbc',
    price: 3600,
    salePrice: 3250,
    image: '/uploads/prod-uniq-1600294037681-c80b4cb5b434.webp',
    description: `Up to 2x more Active Noise Cancellation than the previous generation. Powered by the Apple H2 headphone chip with Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe charging case with built-in speaker and lanyard loop.\n\nSPECIFICATIONS:\n- Chip: Apple H2 chip in earbuds, Apple U1 chip in MagSafe charging case for Precision Finding\n- Audio Tech: Adaptive Audio, Active Noise Cancellation, Transparency Mode, Conversation Awareness\n- Battery: Up to 6 hours listening time on a single charge with ANC (up to 30 hours total with case)\n- Protection: IP54 dust, sweat, and water resistant for both earbuds and case\n- Charging: USB-C, MagSafe, Apple Watch charger, and Qi wireless charging`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
    slug: 'apple-watch-series-9-gps-45mm',
    price: 6400,
    salePrice: 5999,
    image: '/uploads/prod-uniq-1546868871-7041f2a55e12.webp',
    description: `Smarter, brighter, and mightier. Powered by the S9 SiP enabling a magical new way to use your watch without touching the screen using Double Tap gesture. 2,000 nits edge-to-edge display with comprehensive health and fitness tracking.\n\nSPECIFICATIONS:\n- Case Size: 45mm Midnight aluminum case with Midnight Sport Band (M/L)\n- Display: Always-On Retina LTPO OLED, up to 2,000 nits brightness (dims to 1 nit in darkness)\n- Processor: Apple S9 SiP with 64-bit dual-core processor & 4-core Neural Engine\n- Health Sensors: Blood Oxygen sensor, Electrical heart sensor (ECG app), 3rd-gen optical heart sensor, Temperature sensing\n- Battery: 18 hours normal use, up to 36 hours in Low Power Mode, fast magnetic charging\n- Water Resistance: WR50 (50 meters water resistant, swimproof)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Anker 737 Power Bank (PowerCore 24K) 140W Fast Charging',
    slug: 'anker-737-power-bank-140w',
    price: 2400,
    salePrice: 2150,
    image: '/uploads/prod-anker-powerbank.webp',
    description: `Equipped with the latest Power Delivery 3.1 and bi-directional GaN technology to quickly charge devices or get recharged at up to 140W. Massive 24,000mAh capacity charges an iPhone 15 five times or a 16" MacBook Pro to 50% in 40 minutes. Features a real-time smart digital color display.\n\nSPECIFICATIONS:\n- Capacity: 24,000mAh (86.4Wh - airline flight approved)\n- Max Output: 140W via USB-C PD 3.1\n- Ports: 2x USB-C (140W max each), 1x USB-A (18W max)\n- Smart Display: High-resolution color screen showing remaining battery %, output wattage, input wattage, and time to full charge\n- Safety: ActiveShield 2.0 temperature monitoring over 3 million times per day`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    slug: 'logitech-mx-master-3s-mouse',
    price: 1850,
    salePrice: 1650,
    image: '/uploads/prod-uniq-1615663245857-ac93bb7c39e7.webp',
    description: `An icon remastered. Feel every moment of your workflow with even more precision and tactile performance with 90% quieter clicks and an 8,000 DPI track-on-glass optical sensor. Electromagnetic MagSpeed wheel scrolls 1,000 lines per second.\n\nSPECIFICATIONS:\n- Sensor: Darkfield high-precision 8,000 DPI sensor (tracks on glass surfaces min 4mm thickness)\n- Buttons: 7 buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode-shift, Middle click)\n- Scroll Wheels: MagSpeed electromagnetic wheel + thumb wheel for horizontal scrolling\n- Connectivity: Bluetooth Low Energy + Logi Bolt USB Receiver (pairs up to 3 devices with Easy-Switch)\n- Battery: 500mAh Li-Po battery lasts up to 70 days on a full charge (1-min charge gives 3 hours use)`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Apple 20W USB-C Fast Power Adapter',
    slug: 'apple-20w-usbc-power-adapter',
    price: 450,
    salePrice: 380,
    image: '/uploads/prod-uniq-1583863788434-e58a36330cf0.webp',
    description: `Official Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. Charges an iPhone from 0 to 50% in approximately 30 minutes.\n\nSPECIFICATIONS:\n- Output: 20W USB Power Delivery (9V/2.22A, 5V/3A)\n- Connector: USB Type-C port\n- Compatibility: All iPhone, iPad, Apple Watch, and AirPods models\n- Safety: Certified Apple original with over-voltage and thermal surge protection`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Apple AirPods Max Silver Wireless ANC Over-Ear',
    slug: 'apple-airpods-max-silver',
    price: 8900,
    salePrice: 8400,
    image: '/uploads/img-1792081928222-nt9o04.webp',
    description: `Over-ear acoustic masterpiece engineered by Apple. Breathable knit mesh canopy and memory foam ear cushions with stainless steel telescoping arms. Features custom Apple-designed 40mm dynamic drivers and Apple H1 chips in each cup.\n\nSPECIFICATIONS:\n- Drivers: 40mm Apple-designed dynamic drivers with dual neodymium ring magnet motors\n- Processing: Apple H1 headphone chip in each ear cup with computational audio\n- ANC & Spatial: Active Noise Cancellation with Transparency mode and Spatial Audio with dynamic head tracking\n- Battery: Up to 20 hours listening time on a single charge with ANC enabled`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Apple AirPods 3rd Gen with MagSafe Charging Case',
    slug: 'apple-airpods-3rd-gen',
    price: 2600,
    salePrice: 2350,
    image: '/uploads/img-1792081928162-ga8j5j.webp',
    description: `AirPods 3 featuring contoured design with shorter stem and force sensor controls. Personalized Spatial Audio with dynamic head tracking places sound all around you, with Adaptive EQ tuning music to your ears.\n\nSPECIFICATIONS:\n- Audio: Custom high-excursion Apple driver, custom high dynamic range amplifier, Adaptive EQ\n- Battery: Up to 6 hours listening time (up to 30 hours total with MagSafe case)\n- Protection: IPX4 sweat and water resistant`
  },
  {
    shopSlug: 'accra-gadget-hub-test',
    categorySlug: 'audio-accessories',
    name: 'Amazon Echo Plus 2nd Gen Smart Speaker with Alexa & Dolby',
    slug: 'amazon-echo-plus-2nd-gen',
    price: 1950,
    salePrice: 1750,
    image: '/uploads/img-1792081928115-mlw1rt.webp',
    description: `Premium 360-degree omnidirectional smart speaker featuring Dolby audio processing with a 3.0" neodymium woofer and 0.8" tweeter. Built-in Zigbee smart home hub and seven far-field beamforming microphones.\n\nSPECIFICATIONS:\n- Audio: 3.0" (76.2mm) downward-firing woofer and 0.8" (20mm) tweeter with Dolby tuning\n- Smart Hub: Built-in Zigbee hub to control compatible smart bulbs, plugs, and door locks\n- Microphones: 7-microphone array with noise cancellation for voice pickup across rooms\n- Connectivity: Dual-band Wi-Fi 802.11 a/b/g/n/ac & Bluetooth A2DP`
  },

  // ==========================================
  // 2. LABADI SURF & ACTIVE CO.
  // ==========================================
  // Hydration Bottles (6)
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: 'Stainless Steel Vacuum Insulated Travel Tumbler with Straw (600ml)',
    slug: 'stainless-steel-vacuum-insulated-travel-tumbler-600ml',
    price: 280,
    salePrice: 245,
    image: '/uploads/prod-stainless-steel-tumbler.webp',
    description: `Engineered for intense Ghanaian beach workouts and daily hydration, this 600ml stainless steel insulated travel tumbler keeps cold drinks ice-cold for 24 hours. Features a durable powder-coated matte black finish that will not sweat or slip, paired with a splash-proof Tritan lid and reusable 304 food-grade stainless steel straw with comfort silicone tip.\n\nSPECIFICATIONS:\n- Material: Double-wall kitchen-grade 18/8 (304) stainless steel\n- Capacity: 600ml / 20oz\n- Thermal Retention: 24 Hours Cold / 12 Hours Hot (TempShield vacuum insulation)\n- Lid: Splash-resistant BPA-free Tritan slider lid with silicone gasket seal\n- Straw: Reusable 304 stainless steel straw with food-grade black silicone comfort tip\n- Finish: Sweat-proof powder-coated matte black exterior\n- Base Diameter: 7.2cm (fits all standard car cup holders and gym equipment consoles)`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: '2.2-Litre Motivational Time-Marker Fitness Water Jug',
    slug: '2-litre-motivational-time-marker-fitness-water-jug',
    price: 220,
    salePrice: 195,
    image: '/uploads/prod-motivational-water-jug.webp',
    description: `Crush your daily hydration targets with this half-gallon 2.2L fitness water jug. Emblazoned with hourly motivational time markers from 7AM to 9PM, it reminds you when to drink throughout your active day. Built with an ergonomic heavy-duty side carry handle, leakproof flip-top locking spout, and silicone straw.\n\nSPECIFICATIONS:\n- Capacity: 2.2 Litres / 74 fl oz (Full Daily Recommended Hydration)\n- Material: 100% BPA-Free and DEHP-Free food-grade PETG polymer\n- Time Markers: Hourly goal timestamps (7AM - 9PM) with capacity scale (0.4L to 2.2L)\n- Spout: Push-button one-touch flip top with safety locking latch\n- Portability: Ergonomic molded side handle + heavy-duty nylon woven wrist lanyard\n- Opening: Extra-wide 8cm mouth for adding full ice cubes and protein scoops easily`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: 'BPA-Free Tritan Fruit Infuser Sports Gym Water Bottle (800ml)',
    slug: 'bpa-free-tritan-fruit-infuser-sports-gym-water-bottle-800ml',
    price: 190,
    salePrice: 165,
    image: '/uploads/prod-fruit-infuser-bottle.webp',
    description: `Infuse fresh Ghanaian fruits—lemons, pineapples, cucumbers, and mint—directly into your workout water. Features a full-length removable central infusion rod that allows natural fruit vitamins and antioxidants to steep thoroughly while keeping seeds and pulp contained.\n\nSPECIFICATIONS:\n- Capacity: 800ml / 27 fl oz\n- Material: Shatterproof, crystal-clear 100% USA Eastman Tritan copolyester (BPA-free)\n- Infusion Chamber: Full-length perforated food-grade infusion basket rod\n- Lid: Leakproof flip-cap with dual silicone sealing rings and metal safety locking latch\n- Grip: Non-slip finger grooves with integrated carrying loop\n- Cleaning: Top-rack dishwasher safe, stain-resistant, and odor-resistant`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: 'Matte Olive Green Insulated Stainless Steel Sports Bottle (750ml)',
    slug: 'matte-olive-green-insulated-stainless-steel-sports-bottle-750ml',
    price: 320,
    salePrice: 280,
    image: '/uploads/prod-uniq-1602143407151-7111542de6e8.webp',
    description: `Minimalist Nordic aesthetic meets tropical coastal performance. High-capacity 750ml double-wall vacuum insulated thermal bottle in a silky matte olive green finish. Copper-lined interior core preserves crisp water temperature even under direct coastal sun.\n\nSPECIFICATIONS:\n- Capacity: 750ml / 25oz\n- Material: Pro-grade 18/8 stainless steel interior and exterior\n- Temperature Control: Keeps ice cold up to 24 hours / piping hot up to 12 hours\n- Cap: Insulated matching stainless steel screw cap with airtight silicone ring\n- Mouth Diameter: 4.8cm (easy filling and drinking)\n- Toxin-Free: 100% BPA, phthalate, and toxin free`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: 'Teak Woodgrain Double-Wall Vacuum Insulated Thermal Flask (500ml)',
    slug: 'teak-woodgrain-double-wall-vacuum-insulated-thermal-flask-500ml',
    price: 260,
    salePrice: 230,
    image: '/uploads/prod-uniq-1589365278144-c9e705f843ba.webp',
    description: `An artisanal blend of natural organic aesthetics and modern thermodynamic engineering. Features a scratch-resistant realistic teak woodgrain exterior finish over a heavy-duty stainless steel thermal flask, topped with a brushed silver cap.\n\nSPECIFICATIONS:\n- Capacity: 500ml / 17oz\n- Material: Food-safe 304 double-wall stainless steel with thermal vacuum barrier\n- Exterior: Hydro-dipped scratch-resistant teak wood pattern\n- Cap: Brushed 304 stainless steel with leakproof gasket\n- Performance: Zero exterior condensation; keeps coffee hot for 12 hours, water iced for 24 hours`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'hydration-bottles',
    name: 'Ergonomic Sports Squeeze Cycling Water Bottle (750ml)',
    slug: 'ergonomic-sports-squeeze-cycling-water-bottle-750ml',
    price: 95,
    salePrice: 80,
    image: '/uploads/prod-uniq-1523362628745-0c100150b504.webp',
    description: `Ultra-lightweight high-flow cycling and running squeeze bottle. Squeezable body delivers a rapid burst of hydration on the move without biting or pulling spouts.\n\nSPECIFICATIONS:\n- Capacity: 750ml / 25oz\n- Material: Food-grade low-density polyethylene (LDPE), 100% BPA/BPS-free\n- Spout: Self-sealing silicone high-flow valve\n- Compatibility: Standard 74mm bicycle water bottle cage diameter\n- Weight: Only 78 grams empty`
  },

  // Fitness Accessories (6)
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'Commercial Solid Cast Iron Rubber Hex Dumbbells (Pair - 15kg)',
    slug: 'commercial-solid-cast-iron-rubber-hex-dumbbells-15kg',
    price: 850,
    salePrice: 780,
    image: '/uploads/prod-uniq-1583454110551-21f2fa2afe61.webp',
    description: `Commercial gym-grade rubber hex dumbbells designed for heavy strength training, crossfit, and functional conditioning. Precision-cast iron core encased in heavy-duty vulcanized virgin rubber prevents floor damage and reduces noise. Ergonomically knurled chrome handles offer non-slip grip.\n\nSPECIFICATIONS:\n- Weight: Pair of 15kg (30kg total / 66 lbs)\n- Core: Solid ASTM A48 Class 20 grey cast iron\n- Coating: Heavy-duty low-odor virgin vulcanized rubber heads\n- Handle: Ergonomic contoured chrome-plated steel with medium diamond knurling (28mm diameter)\n- Anti-Roll: 6-sided hexagonal shape prevents rolling on uneven floorboards or beach platforms`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'Olympic 7-Foot Hard Chrome Barbell with High-Density Bumper Plates Set',
    slug: 'olympic-7-foot-hard-chrome-barbell-with-bumper-plates-set',
    price: 3400,
    salePrice: 3150,
    image: '/uploads/prod-uniq-1517838277536-f5f99be501cd.webp',
    description: `The standard Olympic lifting barbell setup for deadlifts, squats, bench presses, and Olympic snatches. Standard 20kg 7-foot bar with 4 needle bearings per sleeve for smooth rotation under load, accompanied by a pair of 20kg high-density Olympic rubber bumper plates with stainless steel center hubs.\n\nSPECIFICATIONS:\n- Bar Weight & Length: 20kg (44 lbs), 2.2 meters (7.2 feet)\n- Grip Diameter: 28mm Olympic standard with dual IWF/IPF knurl marks (no center knurl)\n- Tensile Strength: 190,000 PSI high-alloy structural spring steel\n- Rotation: 4 needle bearings + 1 brass bushing per sleeve\n- Bumper Plates: Pair of 20kg high-density black crumb rubber bumper plates (450mm diameter, 50.4mm steel collar)\n- Max Load Rating: 450kg / 1,000 lbs`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'Heavy-Duty Olympic Power Squat & Bench Press Rack',
    slug: 'heavy-duty-olympic-power-squat-bench-press-rack',
    price: 2800,
    salePrice: 2550,
    image: '/uploads/prod-uniq-1574680096145-d05b474e2155.webp',
    description: `Heavy commercial squat and strength cage built from 2" x 2" 11-gauge tubular steel. Features laser-cut height adjustments, heavy-duty J-cup barbell rests, long safety spotter arms, and overhead pull-up grips.\n\nSPECIFICATIONS:\n- Construction: 11-gauge 2" x 2" heavy structural carbon steel with powder coat finish\n- Max Load Capacity: 400kg / 880 lbs\n- Height Adjustment: 28 laser-cut vertical pin positions (2-inch hole spacing)\n- Attachments: 2x UHMW-lined J-Hooks, 2x 18-inch safety spotter catch arms\n- Footprint: 120cm wide x 115cm deep x 215cm high (Weight: 68kg)`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'Complete Home Conditioning Set: Neoprene Dumbbells & Resistance Tube',
    slug: 'complete-home-conditioning-set-neoprene-dumbbells-resistance-tube',
    price: 360,
    salePrice: 310,
    image: '/uploads/prod-uniq-1584735935682-2f2b69dff9d2.webp',
    description: `All-in-one toning and mobility training kit. Includes a pair of solid cast iron hand weights with soft-touch non-slip neoprene coating and a high-elasticity natural latex resistance band with cushioned foam comfort handles.\n\nSPECIFICATIONS:\n- Dumbbells: Pair of 3kg cast iron weights with matte non-slip neoprene dip\n- Resistance Tube: 1.2m natural Malaysian latex tube (25 lbs resistance rating)\n- Handles: Sweat-wicking high-density EVA foam cushioned grips with steel carabiners\n- Extras: Door anchor block and breathable nylon mesh drawstring storage bag`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'Commercial Magnetic Resistance Studio Indoor Cycling Spin Bike',
    slug: 'commercial-magnetic-resistance-studio-indoor-cycling-spin-bike',
    price: 5800,
    salePrice: 5300,
    image: '/uploads/prod-uniq-1598289431512-b97b0917affc.webp',
    description: `Commercial indoor cycling bike with ultra-smooth magnetic resistance. Heavy 20kg perimeter-weighted steel flywheel and multi-ribbed belt drive provide an whisper-quiet, frictionless road-cycling feel for high-intensity interval workouts.\n\nSPECIFICATIONS:\n- Flywheel: 20kg (44 lbs) perimeter-weighted precision chrome flywheel\n- Drive System: Poly-V silent belt drive with micro-adjustable magnetic resistance brake\n- Pedals: Dual-sided pedals (SPD clip-in clipless on one side, toe-clip cages on reverse)\n- Adjustability: 4-way micro-adjustable ergonomic racing saddle & multi-grip aero handlebars\n- Monitor: Backlit digital LCD tracking Watts, RPM, Speed, Distance, Heart Rate, and Calories\n- Max User Weight: 150kg (330 lbs)`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'fitness-accessories',
    name: 'High-Density Non-Slip Eco Yoga & Pilates Training Mat (10mm)',
    slug: 'high-density-non-slip-eco-yoga-pilates-training-mat-10mm',
    price: 240,
    salePrice: 210,
    image: '/uploads/prod-uniq-1601925260368-ae2f83cf8b7f.webp',
    description: `Extra-thick 10mm premium yoga and floor workout mat providing maximum cushioning for spine, hips, knees, and elbows on hard surfaces. Double-sided ribbed texture grips both hands and floor to prevent slipping during intense Pilates and yoga flows.\n\nSPECIFICATIONS:\n- Dimensions: 183cm x 61cm x 10mm (72" x 24" x 0.4" thickness)\n- Material: High-density closed-cell NBR memory foam (100% free of latex, PVC, and toxic phthalates)\n- Surface: Ribbed non-slip texture on bottom; smooth moisture-resistant skin on top\n- Maintenance: Easy wipe-clean with mild soap and water\n- Includes: Elastic shoulder carry strap`
  },

  // Dry Bags & Storage (6)
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Heavy-Duty 20L 500D PVC Waterproof Roll-Top Ocean Dry Bag',
    slug: 'heavy-duty-20l-500d-pvc-waterproof-roll-top-ocean-dry-bag',
    price: 320,
    salePrice: 280,
    image: '/uploads/prod-ocean-dry-bag.webp',
    description: `Engineered for offshore surfing, jet-skiing, fishing, and beach excursions along the Ghanaian coastline. Constructed from puncture-proof 500D PVC tarpaulin with high-frequency thermo-welded seams. Triple roll-down seal keeps your gear 100% dry even when fully submerged.\n\nSPECIFICATIONS:\n- Capacity: 20 Litres\n- Material: Heavy-duty 500D PVC coated tarpaulin\n- Seams: High-frequency ultrasonic heat-welded seamless construction (IPX6 waterproof)\n- Closure: Quick-release polymer buckle with triple fold-over seal\n- Strap: Detachable, adjustable reinforced nylon shoulder sling with 360-degree swivel snap hooks\n- Visibility: High-visibility bright yellow with reflective safety lettering`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Floating IPX8 Universal Waterproof Smartphone Dry Bag Pouch',
    slug: 'floating-ipx8-universal-waterproof-smartphone-dry-bag-pouch',
    price: 110,
    salePrice: 85,
    image: '/uploads/prod-phone-pouch.webp',
    description: `Certified IPX8 submersible waterproof phone pouch engineered with built-in air cushion borders that prevent your smartphone from sinking to the ocean floor. Clear optical window enables underwater photography and touchscreen operation without removing your phone.\n\nSPECIFICATIONS:\n- Waterproof Rating: Certified IPX8 down to 30 meters (100 feet)\n- Buoyancy: Air-sponge perimeter rim ensures positive buoyancy (floats on ocean surface)\n- Compatibility: Fits all smartphones up to 7.0 inches diagonal screen size (iPhone 15 Pro Max, Galaxy S24 Ultra)\n- Touch Functionality: High-sensitivity 0.3mm optical TPU touch-responsive membrane\n- Latch: Dual ABS swivel-lock clips with snap closure\n- Lanyard: Heavy-duty 45cm nylon neck strap with safety quick-release clip`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Heavyweight Water-Resistant Waxed Canvas & Top-Grain Leather Explorer Backpack (30L)',
    slug: 'heavyweight-water-resistant-waxed-canvas-top-grain-leather-backpack-30l',
    price: 950,
    salePrice: 880,
    image: '/uploads/prod-uniq-1577733966973-d680bffd2e80.webp',
    description: `A rugged heritage travel rucksack built for overland Ghanaian coastal adventures and daily laptop carry. Built from heavy 16oz paraffin-waxed duck canvas that naturally sheds rain, accented with vegetable-tanned genuine cowhide leather straps and antique solid brass buckles.\n\nSPECIFICATIONS:\n- Capacity: 30 Litres (Dimensions: 46cm H x 32cm W x 18cm D)\n- Fabric: 16oz high-density waterproof waxed cotton canvas\n- Leather: 100% genuine top-grain pull-up cowhide leather straps and base reinforcement\n- Hardware: Solid antique brass roller buckles and copper rivets\n- Compartments: Padded 15.6" laptop sleeve, dual expandable side water bottle pockets, zippered security pocket\n- Shoulder Straps: Ergonomic contoured canvas straps padded with breathable high-density foam`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Artisanal Saddle Tan Full-Grain Leather Daypack Rucksack',
    slug: 'artisanal-saddle-tan-full-grain-leather-daypack-rucksack',
    price: 1400,
    salePrice: 1280,
    image: '/uploads/prod-uniq-1622560480605-d83c853bc5c3.webp',
    description: `Handcrafted by master leather artisans from 100% full-grain pull-up leather in a rich saddle tan patina. Develops an exquisite vintage character with age. Features heavy-duty brass YKK zips, spacious front flap pouch, and padded shoulder straps.\n\nSPECIFICATIONS:\n- Material: 100% vegetable-tanned full-grain bovine leather (1.8mm thickness)\n- Lining: Heavyweight cotton twill\n- Zippers: Original Japanese YKK brass zippers with leather pullers\n- Laptop Fit: Dedicated sleeve fits up to 14" MacBook Pro\n- Dimensions: 42cm x 30cm x 14cm (Weight: 1.35kg)`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Weatherproof Urban Commuter Laptop Backpack (25L)',
    slug: 'weatherproof-urban-commuter-laptop-backpack-25l',
    price: 480,
    salePrice: 420,
    image: '/uploads/prod-uniq-1553062407-98eeb64c6a62.webp',
    description: `Sleek, minimalist matte black commuter backpack designed to protect electronics from sudden tropical rainfall. Built with 600D water-repellent ballistic nylon, PU reverse-coil weather-resistant zippers, and an airflow padded mesh back panel.\n\nSPECIFICATIONS:\n- Capacity: 25 Litres\n- Outer Shell: 600D ballistic water-repellent polyester with polyurethane back coating\n- Protection: Padded 360-degree shockproof compartment fitting up to 16" laptops\n- Ergonomics: Molded EVA foam back panel with channeled airflow ventilation\n- Features: Hidden anti-theft passport pocket on rear, luggage handle pass-through strap`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'dry-bags-storage',
    name: 'Sandproof Quick-Dry Mesh Beach & Snorkel Gear Duffle Bag',
    slug: 'sandproof-quick-dry-mesh-beach-snorkel-gear-duffle-bag',
    price: 240,
    salePrice: 195,
    image: '/uploads/prod-uniq-1581605405669-fcdf81165afa.webp',
    description: `Extra-large open-mesh equipment duffle that lets ocean sand and saltwater sift right out. Breathable mesh enables wet rash guards, board shorts, dive fins, and beach towels to air-dry rapidly without developing mildew.\n\nSPECIFICATIONS:\n- Volume: 45 Litres (Dimensions: 65cm L x 30cm W x 30cm H)\n- Mesh: Heavy-duty tear-resistant PVC-coated polyester open mesh\n- Base: Reinforced 600D solid polyester bottom to protect contents when placed on damp sand\n- Carry: Wrap-around reinforced webbed carry handles with padded grip + removable shoulder strap`
  },

  // Coastal Activewear (6)
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'Quick-Dry 4-Way Stretch Tropical Wave Rider Board Shorts',
    slug: 'quick-dry-4-way-stretch-tropical-wave-rider-board-shorts',
    price: 280,
    salePrice: 240,
    image: '/uploads/prod-mens-board-shorts.webp',
    description: `Engineered for surfing Labadi Beach swells and coastal training. Crafted from ultra-flexible 4-way stretch fabric with DWR water-repellent coating. Features an anti-rash seamless inner leg, secure lace-up waistband, and side zippered drainage pocket with key loop.\n\nSPECIFICATIONS:\n- Fabric: 90% recycled polyester / 10% spandex 4-way performance stretch\n- Inseam: 9" inseam (19" outseam at-the-knee fit)\n- Coating: PFC-free DWR (Durable Water Repellent) for instantaneous drying\n- Fly: Gusseted lycra fly with braided drawcord and silicone-tapped eyelets\n- Storage: Right-hip welded waterproof zipper pocket with internal shock-cord key bungee`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'High-Waisted UV Compression Athletic Workout Leggings',
    slug: 'high-waisted-uv-compression-athletic-workout-leggings',
    price: 310,
    salePrice: 265,
    image: '/uploads/prod-compression-leggings.webp',
    description: `Squat-proof, buttery-soft performance compression tights designed for beach sprints, yoga, and gym workouts. Engineered with a 4.5" seamless double-layer waistband that stays locked in place, dual deep side drop-in pockets that securely hold smartphones, and certified UPF 50+.\n\nSPECIFICATIONS:\n- Fabric: 78% nylon / 22% spandex high-gauge four-way stretch interlock knit\n- Opacity: 100% squat-proof, non-sheer under high tension\n- Waistband: 4.5-inch seamless high-waist band with targeted abdominal compression\n- Pockets: 2x deep side drop-in smartphone pockets (fits iPhone 15 Pro Max)\n- Sun Defense: UPF 50+ blocks 98% of harmful UVA and UVB radiation`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'Long-Sleeve Black & Gold Athletic Compression Rash Guard (UPF 50+)',
    slug: 'long-sleeve-black-gold-athletic-compression-rash-guard-upf50',
    price: 290,
    salePrice: 250,
    image: '/uploads/prod-athletic-rashguard.webp',
    description: `Protect your skin from harsh tropical equatorial UV radiation, board wax friction, and surf rashes. Form-fitting ergonomic compression construction improves muscle oxygenation and recovery, with flatlock anti-chafing seams throughout.\n\nSPECIFICATIONS:\n- Material: 85% polyester / 15% spandex technical compression jersey\n- Sun Protection: UPF 50+ certified solar barrier\n- Stitching: 6-thread flatlock anti-chafing seams designed to eliminate skin irritation\n- Hem: Internal silicone anti-slip gripper strip along bottom hem prevents ride-up\n- Neckline: Ergonomic crew neck with raglan sleeves for uninhibited shoulder paddle rotation`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'Breathable Moisture-Wicking Sleeveless Gym Training Tank Top',
    slug: 'breathable-moisture-wicking-sleeveless-gym-training-tank-top',
    price: 160,
    salePrice: 135,
    image: '/uploads/prod-sleeveless-gym-tank.webp',
    description: `Featherweight training tank crafted from micro-mesh technical polyester in heather grey. Built with deep armholes for unrestricted lat and shoulder mobility, and rapid capillary moisture-wicking technology to keep you dry through the most grueling tropical heat.\n\nSPECIFICATIONS:\n- Material: 100% ultralight micro-mesh breathable polyester (140 GSM)\n- Technology: Advanced capillary moisture-wicking system with anti-odor silver ion treatment\n- Cut: Athletic relaxed fit with scooped neck and drop-cut armholes\n- Seams: Reinforced dual-needle hem stitching for durability`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'Labadi Coastal Fleece Crop Hoodie & Joggers 2-Piece Warmup Tracksuit',
    slug: 'labadi-coastal-fleece-crop-hoodie-joggers-tracksuit',
    price: 520,
    salePrice: 460,
    image: '/uploads/prod-uniq-1515886657613-9f3515b0c78f.webp',
    description: `The signature post-surf warmup tracksuit in energetic coastal sunshine yellow. Made from heavy 340 GSM brushed-back cotton fleece that traps warmth after sunset ocean dips. Includes a relaxed cropped hoodie with double-lined hood and matching high-waisted cuffed joggers.\n\nSPECIFICATIONS:\n- Fabric: Heavyweight 80% combed cotton / 20% polyester fleece (340 GSM)\n- Interior: Ultra-soft brushed fleece lining\n- Hoodie: Boxy cropped cut with drop shoulders and rib-knit cuffs\n- Joggers: Elastic waistband with interior drawstring, deep slash pockets, tapered rib cuffs`
  },
  {
    shopSlug: 'labadi-surf-active',
    categorySlug: 'coastal-activewear',
    name: 'Tactical Stretch Ripstop Outdoor Cargo Joggers with Flap Pockets',
    slug: 'tactical-stretch-ripstop-outdoor-cargo-joggers-flap-pockets',
    price: 380,
    salePrice: 325,
    image: '/uploads/prod-uniq-1548883354-7622d03aca27.webp',
    description: `Heavy-duty outdoor and coastal utility cargo joggers crafted from rugged stretch ripstop fabric with a water-repellent DWR finish. Built with 6 practical gear pockets including dual reinforced snap-flap cargo thigh pouches, articulated knees, and elasticated tapered cuffs.\n\nSPECIFICATIONS:\n- Fabric: 97% cotton / 3% elastane cross-weave tear-resistant ripstop\n- Coating: DWR water-resistant finish sheds light rain and sea spray\n- Pockets: 6 total (2 deep hand slash pockets, 2 snap-flap cargo pockets, 2 back welt pockets)\n- Mobility: Gusseted crotch and articulated knee darts for uninhibited movement\n- Waist & Hem: Elasticated waistband with heavy-duty metal drawstring tips + elastic ankle cuffs`
  }
];

console.log('Total catalog entries defined:', CATALOG.length);

async function syncToDatabase(prismaClient, label) {
  console.log(`\n================ Syncing to ${label} ================`);
  for (const item of CATALOG) {
    try {
      // Find shop
      const shop = await prismaClient.shop.findUnique({ where: { slug: item.shopSlug } });
      if (!shop) {
        console.warn(`[${label}] Shop not found: ${item.shopSlug}`);
        continue;
      }

      // Find category
      const category = await prismaClient.shopCategory.findFirst({
        where: { shopId: shop.id, slug: item.categorySlug }
      });

      // Upsert product
      const product = await prismaClient.product.upsert({
        where: {
          shopId_slug: { shopId: shop.id, slug: item.slug }
        },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          salePrice: item.salePrice || null,
          shopCategoryId: category ? category.id : null,
          isAvailable: true,
          status: 'PUBLISHED'
        },
        create: {
          shopId: shop.id,
          shopCategoryId: category ? category.id : null,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          salePrice: item.salePrice || null,
          stock: 35,
          isAvailable: true,
          status: 'PUBLISHED'
        }
      });

      // Update image
      await prismaClient.productImage.deleteMany({ where: { productId: product.id } });
      await prismaClient.productImage.create({
        data: {
          productId: product.id,
          url: item.image,
          altText: item.name,
          displayOrder: 0,
          isPrimary: true
        }
      });

      console.log(`[${label}] Updated: ${item.name} (${item.image})`);
    } catch (err) {
      console.error(`[${label}] Error on ${item.name}:`, err.message);
    }
  }
}

async function run() {
  const localPrisma = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
  await syncToDatabase(localPrisma, 'LOCAL POSTGRES');
  await localPrisma.$disconnect();

  const supabasePrisma = new PrismaClient({ datasources: { db: { url: SUPABASE_URL } } });
  await syncToDatabase(supabasePrisma, 'SUPABASE POOLER');
  await supabasePrisma.$disconnect();

  console.log('\nAll databases synced successfully!');
}

run().catch(console.error);
