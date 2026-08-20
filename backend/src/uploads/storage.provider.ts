// Swappable per CLAUDE.md §1 ("S3-compatible bucket for property photos /
// design images"). LocalDiskStorageProvider is a fully working default (not
// a fake placeholder — files really are stored and served) so photo upload
// works out of the box; swap in S3StorageProvider by setting AWS_S3_BUCKET
// (see uploads.module.ts) once a real bucket exists.
export interface StorageProvider {
  upload(buffer: Buffer, contentType: string, filename: string): Promise<{ url: string }>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
