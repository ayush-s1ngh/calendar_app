import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { getCurrentUser } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  setAuthTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const tokens = localStorage.getItem('auth_tokens');
      if (!tokens) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_tokens');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        localStorage.removeItem('auth_tokens');
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const setAuthTokens = (tokens: AuthTokens) => {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_tokens');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    setAuthTokens,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};