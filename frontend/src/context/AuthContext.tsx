import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types';
import { api } from '../services/api';
import { parseJwt } from '../utils/formatters';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error, info } = useToast();

  const logout = useCallback(() => {
    api.clearSession();
    setUser(null);
    info('Logged out', 'You have been safely signed out.');
  }, [info]);

  const initAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userIdStr = localStorage.getItem('user_id');

      if (!accessToken || !refreshToken || !userIdStr) {
        setIsLoading(false);
        return;
      }

      const decoded = parseJwt(accessToken);
      const userId = parseInt(userIdStr, 10);
      const role = (decoded?.role as string) || localStorage.getItem('user_role') || 'User';
      const email = localStorage.getItem('user_email') || '';
      const userName = localStorage.getItem('user_name') || 'User';

      // Check if token is expired
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        try {
          const newTokens = await api.refreshToken({ refreshToken, userId });
          api.setSession(newTokens.accessToken, newTokens.refreshToken, userId, role);
        } catch {
          logout();
          setIsLoading(false);
          return;
        }
      }

      setUser({
        id: userId,
        userName,
        email,
        role,
      });

      // Optionally fetch updated user details if email is known
      if (email) {
        try {
          const freshUser = await api.getUserByEmail(email);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('user_name', freshUser.userName);
            localStorage.setItem('user_role', freshUser.role);
          }
        } catch {
          // Non-blocking fallback
        }
      }
    } catch (err) {
      console.error('Failed to initialize session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initAuth();

    const handleExpired = () => {
      logout();
      error('Session Expired', 'Please sign in again to continue.');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [initAuth, logout, error]);

  const login = async (payload: LoginPayload) => {
    try {
      setIsLoading(true);
      const tokenRes = await api.login(payload);
      const decoded = parseJwt(tokenRes.accessToken);

      const userId = decoded?.nameid ? parseInt(decoded.nameid, 10) : 0;
      const role = (decoded?.role as string) || 'User';

      api.setSession(tokenRes.accessToken, tokenRes.refreshToken, userId, role);
      localStorage.setItem('user_email', payload.email);

      let fetchedUser: User = {
        id: userId,
        userName: payload.email.split('@')[0],
        email: payload.email,
        role,
      };

      try {
        const profile = await api.getUserByEmail(payload.email);
        if (profile) {
          fetchedUser = profile;
          localStorage.setItem('user_name', profile.userName);
        }
      } catch {
        // Fallback to decoded user
      }

      setUser(fetchedUser);
      success('Welcome back!', `Signed in as ${fetchedUser.userName || fetchedUser.email}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      error('Authentication Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      setIsLoading(true);
      await api.register(payload);
      success('Registration Complete', 'Your account has been created successfully!');

      // Automatically sign in the user
      await login({ email: payload.email, password: payload.password });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      error('Registration Error', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?.email) {
      try {
        const fresh = await api.getUserByEmail(user.email);
        setUser(fresh);
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
