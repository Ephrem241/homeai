import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FavoritesModule } from './favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { LocationsModule } from './locations/locations.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    LocationsModule,
    PropertiesModule,
    UsersModule,
    FavoritesModule,
  ],
})
export class AppModule {}
