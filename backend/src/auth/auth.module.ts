import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConsoleSmsProvider } from './console-sms.provider';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { SMS_PROVIDER } from './sms.provider';
import { TwilioSmsProvider } from './twilio-sms.provider';

const logger = new Logger('AuthModule');

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET is not set — using an insecure dev-only default. Set it before deploying.');
}

const hasTwilio = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER,
);
if (!hasTwilio) {
  logger.warn('No TWILIO_* env vars set — OTP codes will be logged to the console instead of texted.');
}

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
    { provide: SMS_PROVIDER, useClass: hasTwilio ? TwilioSmsProvider : ConsoleSmsProvider },
  ],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
