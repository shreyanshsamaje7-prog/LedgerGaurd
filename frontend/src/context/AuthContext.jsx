import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lg_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Sync current user on mount or token change
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem('lg_auth_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await authApi.getMe();
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        if (isMounted) {
          localStorage.removeItem('lg_auth_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      if (data?.token) {
        localStorage.setItem('lg_auth_token', data.token);
        setToken(data.token);
      }
      if (data?.user) {
        setUser(data.user);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (params, maybePassword, maybeName, maybeIsSystemUser, maybeKey) => {
    let payload;
    if (typeof params === 'object' && params !== null) {
      payload = params;
    } else {
      payload = {
        email: params,
        password: maybePassword,
        name: maybeName,
        isSystemUser: maybeIsSystemUser,
        systemUserKey: maybeKey
      };
    }
    setIsLoading(true);
    try {
      const data = await authApi.register(payload);
      if (data?.token) {
        localStorage.setItem('lg_auth_token', data.token);
        setToken(data.token);
      }
      if (data?.user) {
        setUser(data.user);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Continue cleanup regardless
    } finally {
      localStorage.removeItem('lg_auth_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
