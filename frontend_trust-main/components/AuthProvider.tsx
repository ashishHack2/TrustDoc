'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, isLoggedIn } from '@/lib/api';
import type { TokenResponse } from '@/lib/api';

type AuthUser = {
  email: string;
  role: TokenResponse['role'];
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: () => {},
});

function decodeJwt(token: string): { email?: string; sub?: string; role?: string } | null {
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
      });
    }
    return { error };
  }, []);

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
