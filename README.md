# The Ultimate Virtual Mall 🏬🇬🇭

> **A Next-Generation, Production-Grade Multi-Vendor E-Commerce Platform for Ghana & West Africa.**

The Ultimate Virtual Mall translates a premium physical shopping mall into a high-performance digital commerce ecosystem. Multiple independent merchants host and customize their dedicated online storefronts under one central parent mall, complete with inventory management, product variants, order fulfilment, Ghana-focused Paystack payments (Mobile Money & Cards), multi-seller carts, automated commission settlements, and robust tenant isolation.

---

## 🌟 Key Architecture & Principles

### 1. Zero Dummy Data Mandate
At launch, the platform intentionally contains **0 fake shops, 0 dummy products, 0 fabricated reviews, and 0 simulated sales**. An empty catalogue displays polished, intentional empty states with clear calls-to-action for customers and prospective merchants ("Your next favourite shop will be here", "Open a Shop in The Ultimate Virtual Mall").

### 2. Ready-Made Reusable Storefront Templates
Every approved merchant automatically receives a fully provisioned storefront with custom branding, logo/cover image, category navigation, shop search, product grids, stock availability, responsive layouts, WhatsApp quick-inquiry integration, and individual policies.

### 3. Multi-Seller Cart & Split Orders
Customers can browse across multiple merchants simultaneously. At checkout, a single unified payment transaction securely splits into vendor-specific child orders with individual fulfillment statuses, shipping charges, and commission tracking.

### 4. Ghana-Focused Paystack Integration
- **Channels**: Mobile Money (MTN MoMo, Telecel Cash, AT Money) and Bank Cards (Visa, Mastercard).
- **Currency**: Ghanaian Cedi (GHS / GH₵) with calculations executed in integer minor units (pesewas) to eliminate floating-point arithmetic drift.
- **Security**: HMAC SHA512 signature verification for webhooks, server-side transaction status verification, and idempotent webhook processing. Browser redirects are never trusted as proof of payment.

### 5. Multi-Tenant Security & Isolation
Merchant dashboards and API endpoints enforce strict server-side tenant isolation (`shopId` validation). Unauthorized attempts to mutate or view another vendor's inventory, orders, or private financial records are blocked and logged.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **Database** | PostgreSQL |
| **ORM & Migrations** | Prisma 6.4.1 |
| **Authentication** | Secure JWT Session Cookies (`jose`), bcrypt password hashing |
| **Payments** | Paystack API (Mobile Money & Card integration, Webhooks) |
| **Messaging** | WhatsApp Business Click-to-Chat protocol, Transactional Emails |
| **Testing** | Automated End-to-End Test Suite (23 test cases) |

---

## 🔑 Administrative Access

The initial super administrator account is pre-configured and seeded into the database:

- **Portal URL**: `/admin`
- **Username**: `Big Sam`
- **Email**: `bigsam@theultimatemall.com`
- **Password**: `BigSam12345`

*Note: In production environments, administrators are advised to change their default credentials immediately via the admin profile settings.*

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL database running locally or in the cloud (e.g. Supabase, Neon)

### 1. Clone & Install
```bash
git clone https://github.com/einsteinjunir3002-cyber/the-ultimate-virtual-mall.git
cd the-ultimate-virtual-mall
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL database URL, Paystack API keys, and JWT secret:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="replace_with_a_secure_random_string_at_least_32_chars"

SUPER_ADMIN_USERNAME="Big Sam"
SUPER_ADMIN_PASSWORD="BigSam12345"
SUPER_ADMIN_EMAIL="bigsam@theultimatemall.com"

PAYSTACK_SECRET_KEY="sk_test_xxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxx"

DEFAULT_COMMISSION_PERCENT="5.0"
CURRENCY="GHS"
CURRENCY_SYMBOL="GH₵"
```

### 3. Initialize Database & Seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

An automated verification test suite is included in `scripts/run-e2e-tests.ts`. It executes 23 comprehensive tests against real API endpoints:
- Baseline zero-dummy data verification
- Super admin authentication
- Merchant onboarding application workflow
- Administrator review & approval
- Ready-made storefront generation & theme customization
- Product publication with variants & stock
- Multi-tenant data isolation enforcement
- Multi-seller cart & split-order creation
- Paystack webhook HMAC verification & stock decrement
- Verified-purchase customer reviews policy

To run the automated tests:
```bash
npm run test:e2e
```

---

## 🌐 Production Deployment

### 1. Database (Supabase / Managed PostgreSQL)
1. Create a new project in [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the Connection Pooling or Direct Connection URI into `DATABASE_URL`.
3. Apply migrations: `npx prisma migrate deploy`
4. Run the seed script: `npx prisma db seed`

### 2. Deploy to Vercel
1. Link your repository in [Vercel](https://vercel.com).
2. Add the environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
   - `PAYSTACK_SECRET_KEY`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `SUPER_ADMIN_USERNAME`
   - `SUPER_ADMIN_PASSWORD`
   - `SUPER_ADMIN_EMAIL`
3. Set the build command to `prisma generate && next build`.
4. Deploy!

### 3. Configure Paystack Webhook
In your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer):
- Set your Webhook URL to: `https://yourdomain.com/api/webhooks/paystack`
- Make sure event notifications for `charge.success` and `transfer.success` are enabled.

---

## 📂 Project Structure

```
├── prisma/
│   ├── schema.prisma       # 16 Relational Models (Users, Shops, Products, Orders, etc.)
│   └── seed.ts             # Big Sam Admin & Mall Categories Seeder
├── scripts/
│   └── run-e2e-tests.ts    # 23 Automated End-to-End Tests
├── src/
│   ├── app/
│   │   ├── (public pages)  # Home, /shops, /products, /about, /terms, etc.
│   │   ├── admin/          # Platform Super Admin Portal (Big Sam)
│   │   ├── api/            # 46 REST Endpoints (Auth, Merchant, Commerce, Admin, Webhook)
│   │   ├── auth/           # Login & Registration
│   │   ├── cart/           # Multi-Vendor Shopping Cart
│   │   ├── checkout/       # Paystack Mobile Money & Card Checkout
│   │   ├── merchant/       # Seller Dashboard & Onboarding
│   │   └── orders/         # Customer Order Tracking & Invoices
│   ├── components/         # Navbar, Footer, ProductCard, ShopCard, EmptyState, etc.
│   ├── context/            # AuthContext, CartContext
│   ├── lib/                # Prisma client, Auth (jose), Paystack, Commission, WhatsApp
│   └── types/              # Domain TypeScript interfaces
└── public/                 # Static Assets
```

---

## 📄 License
Commercial License — Proprietary to The Ultimate Virtual Mall platform operators.
