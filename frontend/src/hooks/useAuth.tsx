import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mock';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const validRoles: UserRole[] = ['ADMIN', 'RECEPTION', 'MECHANIC', 'BILLING'];

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Partial<User>;
  const role = String(user.role || '').toUpperCase() as UserRole;
  if (!validRoles.includes(role)) return null;
  return {
    id: String(user.id || ''),
    name: String(user.name || `${role} User`),
    email: String(user.email || ''),
    role,
    avatar: user.avatar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session
    const savedUser = localStorage.getItem('autovantage_user');
    if (savedUser) {
      try {
        const normalized = normalizeUser(JSON.parse(savedUser));
        if (normalized) {
          setUser(normalized);
          localStorage.setItem('autovantage_user', JSON.stringify(normalized));
        } else {
          localStorage.removeItem('autovantage_user');
        }
      } catch {
        localStorage.removeItem('autovantage_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest<{ user: { id: number; username: string; name: string; role: UserRole } }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const newUser: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: `${response.user.username}@garage.local`,
        role: response.user.role,
      };
      setUser(newUser);
      localStorage.setItem('autovantage_user', JSON.stringify(newUser));
      return { ok: true };
    } catch {
      const account = DEMO_USERS.find(
        (item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password
      );

      if (!account) {
        return { ok: false, message: 'Invalid username or password' };
      }

      const newUser: User = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role as UserRole,
        avatar: account.avatar,
      };
      setUser(newUser);
      localStorage.setItem('autovantage_user', JSON.stringify(newUser));
      return { ok: true, message: 'Logged in with local fallback because API is unavailable' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autovantage_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
