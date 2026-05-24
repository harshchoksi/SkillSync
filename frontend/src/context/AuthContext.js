// src/context/AuthContext.js - Global authentication state
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillsync_token'));
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('skillsync_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
        setToken(savedToken);
      } catch {
        // Token invalid – clear storage
        localStorage.removeItem('skillsync_token');
        localStorage.removeItem('skillsync_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('skillsync_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('skillsync_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // Update local user state after profile edits
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isSeller = user?.role === 'seller' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, isSeller, isAdmin, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
