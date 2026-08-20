import { Injectable, Logger } from '@nestjs/common';

import type { SmsProvider } from './sms.provider';

// Real implementation, active once TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
// TWILIO_FROM_NUMBER are set (see auth.module.ts). Calls Twilio's REST API
// directly over fetch rather than pulling in the full `twilio` SDK — this is
// the entire integration surface, so no dependency is worth the weight.
@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  readonly isConsole = false;

  private readonly accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  private readonly authToken = process.env.TWILIO_AUTH_TOKEN as string;
  private readonly fromNumber = process.env.TWILIO_FROM_NUMBER as string;

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phoneE164,
      From: this.fromNumber,
      Body: `Your HomiAI verification code is ${code}. It expires in 10 minutes.`,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`Twilio send failed (${response.status}): ${detail}`);
      throw new Error('Failed to send verification code');
    }
  }
}
