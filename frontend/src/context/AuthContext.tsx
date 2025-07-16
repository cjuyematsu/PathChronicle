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
  updateUserCountry: (countryCode: string) => Promise<void>;
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

  const updateUserCountry = async (countryCode: string) => {
    const token = Cookies.get('auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch('/api/auth/update-country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ countryCode }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response. Check your API endpoint.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update country');
      }

      setUser(prev => prev ? { ...prev, countryCode } : null);
      
    } catch (error) {
      console.error('Error updating country:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          alert('Server error: API endpoint not found or returning HTML instead of JSON');
        } else {
          alert(error.message);
        }
      }
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('auth-token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      signup, 
      login, 
      logout,
      updateUserCountry 
    }}>
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