// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { employee, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      // Set user state
      setUser(employee);
      setIsAuthenticated(true);

      return { success: true, data: employee };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const signup = async (data) => {
    try {
      const response = await authAPI.signup(data);
      const { employee, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      // Set user state
      setUser(employee);
      setIsAuthenticated(true);

      return { success: true, data: employee };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.employee);
      return { success: true, data: response.data.employee };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const changePassword = async (data) => {
    try {
      await authAPI.changePassword(data);
      return { success: true };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await authAPI.requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const confirmPasswordReset = async (data) => {
    try {
      await authAPI.confirmPasswordReset(data);
      return { success: true };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const response = await authAPI.verifyResetToken(token);
      return { success: true, data: response.data };
    } catch (error) {
      const errors = handleAPIError(error);
      return { success: false, errors };
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole(['admin', 'manager']);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    verifyResetToken,
    hasRole,
    isAdmin,
    isManager,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;