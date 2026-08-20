import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { SMS_PROVIDER, type SmsProvider } from './sms.provider';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const JWT_TTL = '30d';

function hashCode(code: string, salt: string): string {
  return scryptSync(code, salt, 32).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
  ) {}

  async requestOtp(phone: string): Promise<{ sent: true; devCode?: string }> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const salt = randomBytes(16).toString('hex');

    // One active code per phone — a new request supersedes rather than stacks,
    // so an old leaked/guessed code can't still be redeemed later.
    await this.prisma.otpCode.updateMany({
      where: { phone, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.prisma.otpCode.create({
      data: { phone, codeHash: hashCode(code, salt), salt, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });

    await this.smsProvider.sendOtp(phone, code);

    // Only the no-op console provider ever echoes the code, and only outside
    // production — a real provider (Twilio) never triggers this branch, so a
    // misconfigured prod deploy can't silently leak codes through the response.
    const devCode = this.smsProvider.isConsole && process.env.NODE_ENV !== 'production' ? code : undefined;
    return { sent: true, devCode };
  }

  async verifyOtp(phone: string, code: string, name?: string): Promise<{ token: string; user: { id: string; name: string; phone: string; email: string | null; role: string; subscriptionTier: string } }> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Code expired — request a new one.');
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Too many attempts — request a new code.');
    }

    const candidateHash = hashCode(code, otp.salt);
    const matches =
      candidateHash.length === otp.codeHash.length &&
      timingSafeEqual(Buffer.from(candidateHash), Buffer.from(otp.codeHash));

    if (!matches) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new BadRequestException('Incorrect code.');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { name: name?.trim() || 'New User', phone, role: 'BUYER' },
    });

    const token = await this.jwt.signAsync({ sub: user.id }, { expiresIn: JWT_TTL });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
