import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { AppRole, User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: AppRole | null;
  signUp: (email: string, password: string, fullName: string, role: AppRole, organizationName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: AppRole,
    organizationName?: string
  ) => {
    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        fullName,
        role,
        organizationName
      });

      localStorage.setItem('token', res.data.token);
      await fetchUser();
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      await fetchUser();
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole: user?.role || null,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
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
