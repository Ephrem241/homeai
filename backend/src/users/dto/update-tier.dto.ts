import { SubscriptionTier } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTierDto {
  @IsEnum(SubscriptionTier)
  tier!: SubscriptionTier;
}
