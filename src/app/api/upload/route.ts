import { NextRequest, NextResponse } from 'next/server';
import { requireMerchant } from '@/lib/auth';
import { apiError, HttpError } from '@/lib/http';
import { detectMediaType, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, saveMedia } from '@/lib/storage';
import { clientIp, hit } from '@/lib/rate-limit';

/**
 * Media (image/video) upload for merchants/admins only.
 * The file type is decided from the file's real bytes (magic numbers); the
 * client-supplied name, extension and MIME type are ignored. The stored name is
 * generated server-side.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireMerchant();

    const rl = hit(`upload:${user.id}:${clientIp(req)}`, 60, 10 * 60_000);
    if (!rl.ok) throw new HttpError(429, 'Too many uploads. Please wait a few minutes.');

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'No file uploaded');
    if (file.size === 0) throw new HttpError(400, 'The uploaded file is empty');
    if (file.size > MAX_VIDEO_BYTES) throw new HttpError(400, 'File size must be under 50MB');

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = detectMediaType(buffer);
    if (!kind) {
      throw new HttpError(400, 'Only genuine JPG, PNG, WEBP, GIF images or MP4, WEBM videos are allowed');
    }

    if ((kind === 'jpg' || kind === 'png' || kind === 'webp' || kind === 'gif') && file.size > MAX_IMAGE_BYTES) {
      throw new HttpError(400, 'Image size must be under 10MB');
    }

    const saved = await saveMedia(buffer, kind);
    return NextResponse.json({ success: true, url: saved.url, storage: saved.storage, kind });
  } catch (error) {
    return apiError(error, 'upload');
  }
}

