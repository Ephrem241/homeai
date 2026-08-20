import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { UPLOADS_DIR } from './uploads/local-disk-storage.provider';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // Serves files written by LocalDiskStorageProvider — a no-op if S3 is
  // configured instead, since nothing gets written here in that case.
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
