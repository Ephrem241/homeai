import { Injectable, Logger } from '@nestjs/common';

import type { SmsProvider } from './sms.provider';

// No SMS provider is configured for this build — logs the code instead of
// sending a real text (same "honest stub" pattern as designs/placeholder-
// image-gen.provider.ts). AuthService only ever echoes the code back in the
// API response when this provider is active AND not in production, so real
// deployments never leak an OTP through the response body.
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);
  readonly isConsole = true;

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    this.logger.log(`[dev] OTP for ${phoneE164}: ${code}`);
  }
}
