import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Deliberately does not $connect() in onModuleInit — Prisma connects lazily
// on first query, so the app can boot (e.g. for /health) before DATABASE_URL
// points at a live database. See CLAUDE.md Phase 0.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      // Conservative pool size — Supabase's session pooler (used here so
      // Prisma's prepared statements work, unlike the transaction-mode
      // pooler) caps concurrent sessions fairly low on free/dev tiers, so we
      // deliberately don't try to hold more connections than that.
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
