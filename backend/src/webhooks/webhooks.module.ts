import { Module } from '@nestjs/common';

import { RevenueCatWebhookController } from './revenuecat-webhook.controller';

@Module({
  controllers: [RevenueCatWebhookController],
})
export class WebhooksModule {}
