import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import type { StorageProvider } from './storage.provider';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

// Returned URLs point back at this same backend process (see uploads
// .controller.ts's static file route) — good enough for local dev /
// single-instance deploys. A real multi-instance or CDN-fronted deploy
// should switch to S3StorageProvider instead.
const PUBLIC_BASE_URL = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  async upload(buffer: Buffer, contentType: string, filename: string): Promise<{ url: string }> {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const ext = contentType.split('/')[1] ?? 'bin';
    const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'photo';
    const key = `${randomUUID()}-${base}.${ext}`;
    await writeFile(join(UPLOADS_DIR, key), buffer);
    return { url: `${PUBLIC_BASE_URL}/uploads/${key}` };
  }
}
