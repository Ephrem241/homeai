import { Logger, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LocalDiskStorageProvider } from './local-disk-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { STORAGE_PROVIDER } from './storage.provider';
import { UploadsController } from './uploads.controller';

const hasS3 = Boolean(process.env.AWS_S3_BUCKET);
if (!hasS3) {
  new Logger('UploadsModule').warn(
    'AWS_S3_BUCKET is not set — uploads are stored on local disk (backend/uploads/) instead of S3.',
  );
}

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [{ provide: STORAGE_PROVIDER, useClass: hasS3 ? S3StorageProvider : LocalDiskStorageProvider }],
})
export class UploadsModule {}
