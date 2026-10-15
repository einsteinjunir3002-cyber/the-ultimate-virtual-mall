import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HttpError } from './http';

export type MediaKind = 'jpg' | 'png' | 'webp' | 'gif' | 'mp4' | 'webm';
export type ImageKind = MediaKind;

export const MEDIA_MIME: Record<MediaKind, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export const IMAGE_MIME = MEDIA_MIME;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_MEDIA_BYTES = MAX_VIDEO_BYTES;

/**
 * Identify an image or video from its real bytes (magic numbers). The client-supplied
 * MIME type and file name are never trusted.
 */
export function detectMediaType(buf: Uint8Array): MediaKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'png';
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50   // WEBP
  ) return 'webp';
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61
  ) return 'gif';
  // MP4: 'ftyp' box header at offset 4
  if (
    buf.length >= 12 &&
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70
  ) return 'mp4';
  // WebM: EBML header 0x1A 0x45 0xDF 0xA3
  if (
    buf.length >= 4 &&
    buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3
  ) return 'webm';
  return null;
}

export const detectImageType = detectMediaType;

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
export const LOCAL_NAME_RE = /^(img|media)-\d{10,}-[a-z0-9]{6,12}\.(jpg|png|webp|gif|mp4|webm)$/;

/** Only URLs we issued ourselves may be stored against shops/products. */
export function isOwnedAssetUrl(url: string): boolean {
  if (/^\/uploads\/(img|media)-\d{10,}-[a-z0-9]{6,12}\.(jpg|png|webp|gif|mp4|webm)$/.test(url)) return true;
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/uploads\/[A-Za-z0-9._-]+\.(jpg|png|webp|gif|mp4|webm)$/.test(url);
}

/**
 * Persist an image or video and return its public URL.
 *  - BLOB_READ_WRITE_TOKEN set  → Vercel Blob (persistent, production path)
 *  - local dev (no VERCEL env)  → ./public/uploads, served by /uploads/[name]
 *  - on Vercel without a token  → fail closed (the serverless filesystem is ephemeral)
 */
export async function saveMedia(buf: Buffer, kind: MediaKind): Promise<{ url: string; storage: 'vercel-blob' | 'local-disk' }> {
  const prefix = kind === 'mp4' || kind === 'webm' ? 'media' : 'img';
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex').slice(0, 8).replace(/[^a-z0-9]/g, 'a')}.${kind}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${name}`, buf, {
      access: 'public',
      contentType: MEDIA_MIME[kind],
      addRandomSuffix: false,
    });
    return { url: blob.url, storage: 'vercel-blob' };
  }

  if (process.env.VERCEL) {
    throw new HttpError(
      503,
      'Media storage is not configured on this deployment. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) or connect S3/Cloudinary storage.'
    );
  }

  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, name), buf);
  return { url: `/uploads/${name}`, storage: 'local-disk' };
}

export const saveImage = saveMedia;

