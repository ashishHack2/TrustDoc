'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isLoggedIn } from '@/lib/api';
import type { TokenResponse } from '@/lib/api';

type AuthUser = {
  email: string;
  role: TokenResponse['role'];
  fullName?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: TokenResponse['role'],
  ) => Promise<{ error: string | null }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: () => {},
});

function decodeJwt(token: string): { email?: string; sub?: string; role?: string; full_name?: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    if (isLoggedIn()) {
      const token = localStorage.getItem('trustdoc_access_token');
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          setUser({
            email: payload.email || payload.sub || 'operator',
            role: (payload.role as TokenResponse['role']) || 'OPERATOR',
            fullName: payload.full_name,
          });
        }
      }
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, error } = await apiLogin(email, password);
    if (token) {
      const payload = decodeJwt(token.access_token);
      setUser({
        email: email,
        role: token.role,
        fullName: payload?.full_name,
      });
    }
    return { error };
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: TokenResponse['role'] = 'OPERATOR',
    ) => {
      const { token, error } = await apiRegister(email, password, fullName, role);
      if (token) {
        setUser({
          email: email,
          role: token.role,
          fullName: fullName,
        });
      }
      return { error };
    },
    [],
  );

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
