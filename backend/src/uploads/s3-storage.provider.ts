import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { StorageProvider } from './storage.provider';

// Real implementation, active once AWS_S3_BUCKET (+ credentials) are set
// (see uploads.module.ts). Works against any S3-compatible endpoint
// (AWS, R2, MinIO, ...) via AWS_S3_ENDPOINT.
@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: Boolean(process.env.AWS_S3_ENDPOINT),
  });
  private readonly bucket = process.env.AWS_S3_BUCKET as string;
  private readonly publicBaseUrl = process.env.AWS_S3_PUBLIC_URL ?? `https://${this.bucket}.s3.amazonaws.com`;

  async upload(buffer: Buffer, contentType: string, filename: string): Promise<{ url: string }> {
    const ext = contentType.split('/')[1] ?? 'bin';
    const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'photo';
    const key = `${randomUUID()}-${base}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return { url: `${this.publicBaseUrl}/${key}` };
  }
}
