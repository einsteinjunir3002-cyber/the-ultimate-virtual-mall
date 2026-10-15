import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Returns the configured Paystack secret key, or null when payments are not
 * configured. There is deliberately NO simulated/demo mode: without a real
 * `sk_test_…` / `sk_live_…` key, payment calls fail closed.
 */
function secretKey(): string | null {
  const key = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
  return /^sk_(test|live)_[A-Za-z0-9_]+$/.test(key) ? key : null;
}

export const isPaystackConfigured = () => secretKey() !== null;

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
    status: string; // 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | 'reversed'
    reference: string;
    amount: number; // pesewas (GHS minor units)
    currency: string;
    channel: string; // 'mobile_money' | 'card' | ...
    paid_at: string | null;
    gateway_response: string;
    customer: { email: string; phone?: string };
  };
}

/** Initialise a Paystack transaction (GHS, card + mobile money). Amount is in integer pesewas. */
export async function initializePaystackTransaction(params: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const key = secretKey();
  if (!key) {
    return { status: false, message: 'Online payments are not configured on this server yet.' };
  }
  if (!Number.isInteger(params.amountPesewas) || params.amountPesewas <= 0) {
    return { status: false, message: 'Invalid payment amount' };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountPesewas,
        currency: 'GHS',
        reference: params.reference,
        callback_url: params.callbackUrl,
        channels: ['card', 'mobile_money'],
        metadata: params.metadata,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return (await response.json()) as PaystackInitResponse;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return { status: false, message: 'Could not reach the payment provider. Please try again.' };
  }
}

/** Verify a transaction directly with Paystack — the only trusted source of payment truth besides signed webhooks. */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const key = secretKey();
  if (!key) return { status: false, message: 'Online payments are not configured on this server yet.' };

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    });
    return (await response.json()) as PaystackVerifyResponse;
  } catch (error) {
    console.error('Paystack verify error:', error);
    return { status: false, message: 'Could not reach the payment provider. Please try again.' };
  }
}

/** Verify the Paystack webhook HMAC-SHA512 signature using a constant-time comparison. */
export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const key = secretKey();
  if (!key || !signatureHeader) return false;
  const expected = crypto.createHmac('sha512', key).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
