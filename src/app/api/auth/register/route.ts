import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { Role } from '@prisma/client';
import { apiError, readJson } from '@/lib/http';
import { registerSchema } from '@/lib/validation';
import { clientIp, hit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rl = hit(`register:${clientIp(req)}`, 10, 60 * 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } });
    }

    // NOTE: any client-supplied `role` is ignored. Everyone starts as a CUSTOMER;
    // MERCHANT is granted only when a super admin approves a shop application.
    const { name, email, password, phone } = registerSchema.parse(await readJson(req));

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), phone: phone ?? null, role: Role.CUSTOMER },
    });

    await setSessionCookie(await createSessionToken({ userId: user.id, email: user.email, name: user.name, role: user.role }));

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    return apiError(error, 'auth/register');
  }
}
