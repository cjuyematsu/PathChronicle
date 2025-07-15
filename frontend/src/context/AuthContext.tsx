"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  name: string;
  email: string;
  countryCode: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, countryCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('auth-token');
    if (token) {
      try {
        const response = await fetch('/api/auth/userdata', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (e) {
        console.error("Session invalid", e);
        Cookies.remove('auth-token');
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signup = async (email: string, password: string, countryCode: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, countryCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      alert('Signup successful! Please sign in.');
      
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      Cookies.set('auth-token', data.token, { expires: 1, secure: true, sameSite: 'strict' });
      
      await fetchUser();
      
      router.push('/');
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  const logout = () => {
    Cookies.remove('auth-token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}