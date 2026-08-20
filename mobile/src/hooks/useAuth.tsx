import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { fetchMe, verifyOtp as verifyOtpApi } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import type { AuthUser } from '../api/types';
import { deleteSecureItem, getSecureItem, setSecureItem } from '../lib/secureStorage';

const TOKEN_KEY = 'homiai_auth_token';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, code: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Replaces the Phase 0-7 "demo persona" stand-in (useDemoUser/useDemoAgent)
// with a real session backed by Phone OTP + JWT (CLAUDE.md §1). Every screen
// that used to call useDemoUser() now reads { user } from here instead.
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function logout() {
    await deleteSecureItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }

  // A 401 from any request (expired/invalid token) drops the session the
  // same way an explicit logout does, rather than leaving every screen
  // stuck re-requesting data it can never get.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getSecureItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      setAuthToken(token);
      try {
        setUser(await fetchMe());
      } catch {
        await deleteSecureItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(phone: string, code: string, name?: string) {
    const { token, user: loggedInUser } = await verifyOtpApi(phone, code, name);
    await setSecureItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(loggedInUser);
  }

  async function refreshUser() {
    setUser(await fetchMe());
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
