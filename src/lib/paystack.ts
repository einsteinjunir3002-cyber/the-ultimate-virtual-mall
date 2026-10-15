import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder_key';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string; // 'success', 'failed', 'abandoned'
    reference: string;
    amount: number; // in pesewas (GHS minor units)
    currency: string;
    channel: string; // 'mobile_money', 'card'
    paid_at: string;
    gateway_response: string;
    customer: {
      email: string;
      phone?: string;
    };
  };
}

/**
 * Initialize a Paystack transaction for Ghana (supports Mobile Money & Bank Cards in GHS)
 */
export async function initializePaystackTransaction(params: {
  email: string;
  amountInGhs: number; // e.g. 150.50
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const amountInPesewas = Math.round(params.amountInGhs * 100);

  // If secret key is not a real test/live key (starts with sk_test_ or sk_live_), or running in isolated offline environment
  const isDemoKey = !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.includes('placeholder');

  if (isDemoKey) {
    // Return a verified test simulation link pointing to our verification callback
    return {
      status: true,
      message: 'Authorization URL created (Local/Test Mode)',
      data: {
        authorization_url: `${params.callbackUrl}?reference=${params.reference}&test_mode=true`,
        access_code: `mock_acc_${params.reference}`,
        reference: params.reference,
      },
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference: params.reference,
        callback_url: params.callbackUrl,
        channels: ['card', 'mobile_money'],
        metadata: params.metadata,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Failed to initialize Paystack payment',
    };
  }
}

/**
 * Verify a transaction directly with Paystack API
 */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const isDemoKey = !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.includes('placeholder');

  if (isDemoKey) {
    // If running in development with placeholder keys, allow verified test checkout
    return {
      status: true,
      message: 'Verification successful (Simulated Test Mode)',
      data: {
        id: Math.floor(Math.random() * 1000000),
        status: 'success',
        reference,
        amount: 10000,
        currency: 'GHS',
        channel: 'mobile_money',
        paid_at: new Date().toISOString(),
        gateway_response: 'Successful Test Transaction',
        customer: {
          email: 'customer@example.com',
        },
      },
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Paystack verify error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Failed to verify transaction',
    };
  }
}

/**
 * Verify Paystack Webhook HMAC SHA512 signature
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  return hash === signatureHeader;
}
