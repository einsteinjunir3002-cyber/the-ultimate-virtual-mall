import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** An error whose message is safe to show to API clients. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Converts any thrown value into a consistent JSON error response.
 * Auth failures become 401/403 (never 500), validation failures become 400,
 * unique-constraint clashes become 409, and everything else is logged and
 * returned as a generic 500 so internals never leak to clients.
 */
export function apiError(error: unknown, context = 'api') {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    const first = error.issues[0];
    const where = first?.path?.length ? `${first.path.join('.')}: ` : '';
    return NextResponse.json({ error: `${where}${first?.message ?? 'Invalid input'}` }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : '';
  if (message === 'UNAUTHORIZED') {
    return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  }
  if (message.startsWith('FORBIDDEN')) {
    return NextResponse.json({ error: 'You do not have permission to do that' }, { status: 403 });
  }
  const code = (error as { code?: string } | null)?.code;
  if (code === 'P2002') return NextResponse.json({ error: 'That value is already in use' }, { status: 409 });
  if (code === 'P2025') return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });

  console.error(`[${context}]`, error);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}

/** Parse a JSON body safely; throws a 400 HttpError on malformed JSON. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Malformed JSON body');
  }
}
