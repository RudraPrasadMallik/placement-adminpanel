import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      setUser({ role: localStorage.getItem('adminRole') || 'ADMIN' });
    }
    setLoading(false);
    console.log('AuthContext - initial auth check completed');
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const data = response?.data;

      if (!data?.success || !data?.token) {
        throw new Error(data?.message || 'Login failed');
      }

      if (data.role !== 'ADMIN') {
        throw new Error('Please log in with an admin account');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminRole', data.role);
      setIsAuthenticated(true);
      setUser({
        role: data.role,
        email: data.email,
        fullName: data.fullName,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
