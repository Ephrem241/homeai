import { apiRequest } from './client';
import type { AuthUser } from './types';

export function requestOtp(phone: string) {
  return apiRequest<{ sent: true; devCode?: string }>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, code: string, name?: string) {
  return apiRequest<{ token: string; user: AuthUser }>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code, name }),
  });
}

export function fetchMe() {
  return apiRequest<AuthUser>('/auth/me');
}
