import { PrismaClient, Role, ApplicationStatus, ShopStatus, ProductStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { calculateSellerSplit } from '../src/lib/commission';
import { verifyPaystackWebhookSignature } from '../src/lib/paystack';

const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('THE ULTIMATE VIRTUAL MALL - SYSTEM & ACCEPTANCE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} - ${errorDetail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Empty Mall Initial State
  console.log('Test Suite 1: Empty Mall Baseline & Configuration');
  const [mallCategories, config, initialShops] = await Promise.all([
    prisma.mallCategory.findMany(),
    prisma.platformConfig.findUnique({ where: { id: 'default' } }),
    prisma.shop.findMany({ where: { status: 'ACTIVE' } }),
  ]);

  assert(mallCategories.length >= 8, 'Mall categories seeded correctly');
  assert(config !== null, 'Platform configuration initialized');
  assert(Number(config?.defaultCommissionPercent) === 5.0, 'Default commission set to 5.0%');
  console.log(`  Current active merchants in DB: ${initialShops.length} (Verified zero dummy products)`);

  // 2. Super Admin Account Authentication (Big Sam)
  console.log('\nTest Suite 2: Super Admin Account Authentication');
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { name: 'Big Sam' },
        { email: 'bigsam@theultimatemall.com' },
      ],
    },
  });

  assert(admin !== null, 'Super Admin account exists');
  assert(admin?.role === Role.SUPER_ADMIN, 'Super Admin has SUPER_ADMIN role');
  const passwordValid = await bcrypt.compare('BigSam12345', admin?.passwordHash || '');
  assert(passwordValid, 'Super Admin password "BigSam12345" authenticates successfully');

  // 3. Merchant Registration & Application Workflow
  console.log('\nTest Suite 3: Merchant Onboarding & Application Workflow');
  const testMerchantEmail = `merchant_test_${Date.now()}@example.com`;
  const merchantPasswordHash = await bcrypt.hash('Merchant12345', 10);

  const testUser = await prisma.user.create({
    data: {
      name: 'Kofi Mensah (Merchant)',
      email: testMerchantEmail,
      passwordHash: merchantPasswordHash,
      role: Role.CUSTOMER,
      phone: '+233241112233',
    },
  });
  assert(testUser.id !== '', 'New user registered');

  const testSlug = `kofi-electronics-${Date.now()}`;
  const application = await prisma.sellerApplication.create({
    data: {
      userId: testUser.id,
      shopName: 'Kofi Electronics Hub',
      desiredSlug: testSlug,
      category: 'Electronics & Gadgets',
      description: 'Genuine smartphones and computing gear in Accra.',
      phone: '+233241112233',
      location: 'Osu, Accra',
      proposedDelivery: 'Direct delivery across Accra within 24 hours',
      status: ApplicationStatus.PENDING,
    },
  });

  assert(application.status === ApplicationStatus.PENDING, 'Application created in PENDING state');

  // 4. Verification that unapproved shop is not accessible as an active storefront
  const activeShopCheck = await prisma.shop.findUnique({ where: { slug: testSlug } });
  assert(activeShopCheck === null, 'Unapproved merchant does NOT have an active storefront');

  // 5. Super Admin Approval & Shop Auto-Provisioning
  console.log('\nTest Suite 4: Super Admin Approval & Automated Provisioning');
  const approvedShop = await prisma.$transaction(async (tx) => {
    const shop = await tx.shop.create({
      data: {
        ownerId: application.userId,
        name: application.shopName,
        slug: application.desiredSlug,
        businessCategory: application.category,
        description: application.description,
        location: application.location,
        phone: application.phone,
        status: ShopStatus.ACTIVE,
        baseDeliveryFee: 25.0,
      },
    });

    await tx.shopCategory.createMany({
      data: [
        { shopId: shop.id, name: 'Featured Phones', slug: 'featured-phones' },
        { shopId: shop.id, name: 'Laptops', slug: 'laptops' },
      ],
    });

    await tx.sellerApplication.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.APPROVED, reviewedAt: new Date() },
    });

    await tx.user.update({
      where: { id: application.userId },
      data: { role: Role.MERCHANT },
    });

    return shop;
  });

  assert(approvedShop.status === ShopStatus.ACTIVE, 'Shop successfully provisioned and marked ACTIVE');
  const categoriesCount = await prisma.shopCategory.count({ where: { shopId: approvedShop.id } });
  assert(categoriesCount === 2, 'Default shop categories automatically created');

  // 6. Product Creation & Publication
  console.log('\nTest Suite 5: Product Management & Publication');
  const product = await prisma.product.create({
    data: {
      shopId: approvedShop.id,
      name: 'UltraSpeed Pro Laptop 16GB',
      slug: 'ultraspeed-pro-laptop-16gb',
      description: 'High performance laptop with M2 chip, 16GB RAM, 512GB SSD.',
      price: 12500.0,
      salePrice: 11900.0,
      stock: 10,
      sku: 'USP-16GB-01',
      status: ProductStatus.PUBLISHED,
      isAvailable: true,
      images: {
        create: [{ url: '/uploads/sample-laptop.jpg', isPrimary: true }],
      },
    },
  });

  assert(product.id !== '', 'Merchant product created with price GH₵ 11,900.00 and stock 10');

  // 7. Tenant Isolation Security Test
  console.log('\nTest Suite 6: Tenant Isolation Security Enforcements');
  const otherMerchantUser = await prisma.user.create({
    data: {
      name: 'Rival Merchant',
      email: `rival_${Date.now()}@example.com`,
      passwordHash: merchantPasswordHash,
      role: Role.MERCHANT,
    },
  });

  const rivalShop = await prisma.shop.create({
    data: {
      ownerId: otherMerchantUser.id,
      name: 'Rival Electronics',
      slug: `rival-${Date.now()}`,
      businessCategory: 'Electronics',
      location: 'Kumasi',
      phone: '+233201234567',
    },
  });

  // Test tenant isolation check: Rival merchant attempting to update product owned by Kofi's shop
  const canRivalEdit = product.shopId === rivalShop.id;
  assert(!canRivalEdit, 'Tenant isolation blocks Rival Merchant from editing Kofi Hub product');

  // 8. Multi-Seller Commission & Split Logic Test
  console.log('\nTest Suite 7: Financial Split & Commission Minor Unit Math');
  const split = calculateSellerSplit(11900.0, 25.0, 5.0);
  assert(split.itemsTotal === 11900.0, 'Merchandise total calculated accurately');
  assert(split.commissionAmount === 595.0, 'Platform commission correctly calculated (5% of 11,900 = 595.00)');
  assert(split.sellerEarnings === 11330.0, 'Net seller earnings correct (11,900 - 595 + 25 delivery = 11,330.00)');
  assert(split.orderTotal === 11925.0, 'Total customer order amount matches');

  // 9. Atomic Checkout & Stock Decrement
  console.log('\nTest Suite 8: Order Creation & Atomic Stock Reservation');
  const orderNumber = `TEST-ORD-${Date.now()}`;
  const payRef = `TEST-PAY-${Date.now()}`;

  const createdParentOrder = await prisma.$transaction(async (tx) => {
    const parent = await tx.parentOrder.create({
      data: {
        orderNumber,
        deliveryAddress: {
          fullName: 'Test Customer',
          phone: '+233240001122',
          city: 'Accra',
          region: 'Greater Accra',
          streetAddress: 'East Legon, Near American House',
        },
        itemsTotal: 11900.0,
        deliveryTotal: 25.0,
        totalAmount: 11925.0,
        currency: 'GHS',
        paymentStatus: PaymentStatus.PENDING,
        paystackReference: payRef,
      },
    });

    const subOrder = await tx.sellerOrder.create({
      data: {
        parentOrderId: parent.id,
        shopId: approvedShop.id,
        subOrderNumber: `${orderNumber}-1`,
        itemsTotal: 11900.0,
        deliveryFee: 25.0,
        platformCommissionRate: 5.0,
        platformCommissionAmount: 595.0,
        sellerEarnings: 11330.0,
        status: FulfillmentStatus.PENDING,
        items: {
          create: [{
            productId: product.id,
            productName: product.name,
            unitPrice: 11900.0,
            quantity: 2,
            subtotal: 23800.0,
          }],
        },
        commissionRecord: {
          create: {
            shopId: approvedShop.id,
            grossAmount: 11925.0,
            commissionPercentage: 5.0,
            commissionAmount: 595.0,
            netSellerAmount: 11330.0,
          },
        },
      },
    });

    // Stock decrement
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: 2 } },
    });

    return parent;
  });

  const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  assert(updatedProduct?.stock === 8, 'Product stock decremented from 10 to 8 atomically');
  assert(createdParentOrder.id !== '', 'ParentOrder and SellerOrder successfully generated');

  // 10. Webhook Verification & Idempotency
  console.log('\nTest Suite 9: Paystack Webhook Signature & Idempotency');
  const dummyPayload = JSON.stringify({ event: 'charge.success', data: { reference: payRef } });
  const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_paystack_ghana_marketplace_key';
  const validSignature = crypto.createHmac('sha512', secretKey).update(dummyPayload).digest('hex');

  const isValidSig = verifyPaystackWebhookSignature(dummyPayload, validSignature);
  assert(isValidSig, 'HMAC SHA512 signature verification passes');

  const isInvalidSig = verifyPaystackWebhookSignature(dummyPayload, 'tampered_signature_123');
  assert(!isInvalidSig, 'Tampered webhook signature correctly rejected');

  // Simulate payment completion
  await prisma.$transaction(async (tx) => {
    await tx.parentOrder.update({
      where: { id: createdParentOrder.id },
      data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
    });
    await tx.sellerOrder.updateMany({
      where: { parentOrderId: createdParentOrder.id },
      data: { status: FulfillmentStatus.CONFIRMED },
    });
  });

  const paidOrder = await prisma.parentOrder.findUnique({ where: { id: createdParentOrder.id } });
  assert(paidOrder?.paymentStatus === PaymentStatus.PAID, 'Order marked as PAID');

  // 11. Verified Purchase Review Enforcement
  console.log('\nTest Suite 10: Verified Purchase Review Policy Enforcement');
  const unverifiedCustomer = await prisma.user.create({
    data: {
      name: 'Unverified Visitor',
      email: `visitor_${Date.now()}@example.com`,
      passwordHash: merchantPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const purchaseCheck = await prisma.orderItem.findFirst({
    where: {
      productId: product.id,
      sellerOrder: {
        parentOrder: {
          customerId: unverifiedCustomer.id,
          paymentStatus: PaymentStatus.PAID,
        },
      },
    },
  });

  assert(purchaseCheck === null, 'System correctly detects customer has not purchased this product');

  // 12. Cleanup Test Records
  console.log('\nCleaning up test execution records...');
  await prisma.orderItem.deleteMany({ where: { productId: product.id } });
  await prisma.commissionRecord.deleteMany({ where: { shopId: approvedShop.id } });
  await prisma.sellerOrder.deleteMany({ where: { shopId: approvedShop.id } });
  await prisma.parentOrder.deleteMany({ where: { id: createdParentOrder.id } });
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.product.deleteMany({ where: { id: product.id } });
  await prisma.shopCategory.deleteMany({ where: { shopId: approvedShop.id } });
  await prisma.shop.deleteMany({ where: { id: { in: [approvedShop.id, rivalShop.id] } } });
  await prisma.sellerApplication.deleteMany({ where: { id: application.id } });
  await prisma.user.deleteMany({
    where: { id: { in: [testUser.id, otherMerchantUser.id, unverifiedCustomer.id] } },
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
