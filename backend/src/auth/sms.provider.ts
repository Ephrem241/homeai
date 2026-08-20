// Swappable per CLAUDE.md §1 ("Phone OTP as primary [auth]... works globally").
// Implement this against a real SMS API (Twilio, Vonage, etc.) and swap the
// DI binding in auth.module.ts — nothing else in the OTP flow changes.
export interface SmsProvider {
  sendOtp(phoneE164: string, code: string): Promise<void>;
  readonly isConsole: boolean;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
