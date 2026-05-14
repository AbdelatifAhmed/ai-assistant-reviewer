'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  totalInterviews: number;
  averageScore: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const storedToken = localStorage.getItem('ai_interview_token');
  const storedUser = localStorage.getItem('ai_interview_user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) as User };
  } catch {
    localStorage.removeItem('ai_interview_token');
    localStorage.removeItem('ai_interview_user');
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      const storedAuth = getStoredAuth();
      setToken(storedAuth.token);
      setUser(storedAuth.user);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem('ai_interview_token', data.data.token);
    localStorage.setItem('ai_interview_user', JSON.stringify(data.data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.auth.register({ name, email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem('ai_interview_token', data.data.token);
    localStorage.setItem('ai_interview_user', JSON.stringify(data.data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ai_interview_token');
    localStorage.removeItem('ai_interview_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
