import { FileInterceptor } from '@nestjs/platform-express';
import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { STORAGE_PROVIDER, type StorageProvider } from './storage.provider';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

// Backs both listing photos (ListingCreateScreen) and AI Designer room
// photos (HomeDesignerScreen) — CLAUDE.md §1 "S3-compatible bucket for
// property photos / design images", now real instead of paste-a-URL.
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_SIZE_BYTES } }))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP, or HEIC images are allowed');
    }
    return this.storage.upload(file.buffer, file.mimetype, file.originalname);
  }
}
