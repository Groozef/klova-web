'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, configureApiAuth } from '@/lib/api/client';
import type { AuthResponse, Role, Locale } from '@/lib/api/types';

interface AuthUser {
  id: string;
  role: Role;
  locale: Locale;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signup: (body: SignupBody) => Promise<void>;
  signin: (body: SigninBody) => Promise<void>;
  signinFromOAuth: (resp: AuthResponse) => void;
  logout: () => Promise<void>;
}

export interface SignupBody {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
}

export interface SigninBody {
  email: string;
  password: string;
}

const Ctx = createContext<AuthContextValue | null>(null);

const REFRESH_KEY = 'klova:refresh_token';
const USER_KEY = 'klova:user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  const persist = useCallback((resp: AuthResponse) => {
    accessTokenRef.current = resp.access_token;
    refreshTokenRef.current = resp.refresh_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_KEY, resp.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
    }
    setUser(resp.user);
  }, []);

  const clear = useCallback(() => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setUser(null);
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    const refresh_token = refreshTokenRef.current;
    if (!refresh_token) return null;
    try {
      const resp = await api<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: { refresh_token },
        skipAuth: true,
      });
      persist(resp);
      return resp.access_token;
    } catch {
      clear();
      return null;
    }
  }, [persist, clear]);

  useEffect(() => {
    configureApiAuth(
      () => accessTokenRef.current,
      () => refresh(),
    );
  }, [refresh]);

  // Restore session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(REFRESH_KEY);
    const cachedUser = localStorage.getItem(USER_KEY);
    if (stored && cachedUser) {
      refreshTokenRef.current = stored;
      try {
        setUser(JSON.parse(cachedUser) as AuthUser);
      } catch {
        // ignore
      }
      refresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refresh]);

  const signup = useCallback(
    async (body: SignupBody) => {
      const resp = await api<AuthResponse>('/auth/signup', { method: 'POST', body, skipAuth: true });
      persist(resp);
      router.push('/feed');
    },
    [persist, router],
  );

  const signin = useCallback(
    async (body: SigninBody) => {
      const resp = await api<AuthResponse>('/auth/signin', { method: 'POST', body, skipAuth: true });
      persist(resp);
      router.push('/feed');
    },
    [persist, router],
  );

  const signinFromOAuth = useCallback(
    (resp: AuthResponse) => {
      persist(resp);
      router.push('/feed');
    },
    [persist, router],
  );

  const logout = useCallback(async () => {
    const refresh_token = refreshTokenRef.current;
    if (refresh_token) {
      await api('/auth/logout', { method: 'POST', body: { refresh_token } }).catch(() => undefined);
    }
    clear();
    router.push('/');
  }, [clear, router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signup, signin, signinFromOAuth, logout }),
    [user, loading, signup, signin, signinFromOAuth, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
