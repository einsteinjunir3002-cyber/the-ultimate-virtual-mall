import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { IMAGE_MIME, LOCAL_NAME_RE, LOCAL_UPLOAD_DIR, type ImageKind } from '@/lib/storage';

/**
 * Serves locally stored uploads (development / self-hosted mode) at request time.
 * Next.js only serves files that existed in /public when the server started, so
 * images uploaded afterwards need this route. Production on Vercel uses Vercel
 * Blob URLs instead and never hits this route.
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!LOCAL_NAME_RE.test(name)) return new NextResponse('Not found', { status: 404 });

  const file = path.join(LOCAL_UPLOAD_DIR, name);
  if (!file.startsWith(LOCAL_UPLOAD_DIR) || !fs.existsSync(file)) return new NextResponse('Not found', { status: 404 });

  const ext = name.split('.').pop() as ImageKind;
  return new NextResponse(new Uint8Array(fs.readFileSync(file)), {
    status: 200,
    headers: {
      'Content-Type': IMAGE_MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
