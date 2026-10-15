import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { apiError, readJson } from '@/lib/http';
import { loginSchema } from '@/lib/validation';
import { clientIp, hit, peek, reset } from '@/lib/rate-limit';

const MAX_FAILURES = 8;
const WINDOW_MS = 15 * 60_000;

export async function POST(req: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await readJson(req));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email or username and password are required' }, { status: 400 });
    }
    const { identifier, password } = parsed.data;

    // Throttle per (IP + account) so one attacker cannot lock a victim out from everywhere
    const key = `login:${clientIp(req)}:${identifier.toLowerCase()}`;
    const gate = peek(key, MAX_FAILURES, WINDOW_MS);
    if (!gate.ok) {
      return NextResponse.json(
        { error: 'Too many failed sign-in attempts. Please wait a few minutes and try again.' },
        { status: 429, headers: { 'Retry-After': String(gate.retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { name: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { shops: { where: { status: 'ACTIVE' }, take: 1 } },
    });

    const valid = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !valid) {
      hit(key, MAX_FAILURES, WINDOW_MS); // record the failure
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    reset(key);
    const activeShop = user.shops[0] || null;

    await setSessionCookie(
      await createSessionToken({ userId: user.id, email: user.email, name: user.name, role: user.role, shopId: activeShop?.id })
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatarUrl: user.avatarUrl,
        shop: activeShop ? { id: activeShop.id, name: activeShop.name, slug: activeShop.slug, status: activeShop.status } : null,
      },
    });
  } catch (error) {
    return apiError(error, 'auth/login');
  }
}
