import { IsString, Matches } from 'class-validator';

// E.164 format (+ up to 15 digits) — global-first per CLAUDE.md §1, never an
// Ethiopia-specific pattern. The mobile client formats/validates with
// libphonenumber-js before this ever gets called; this is the server-side
// backstop.
export class RequestOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone must be in international format, e.g. +15551234567' })
  phone!: string;
}
