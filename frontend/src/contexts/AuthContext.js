import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Validate token by making a test request to an authenticated endpoint
      api.get('/api/organizations')
        .then(response => {
          // Token is valid, keep user logged in
          console.log('Token validation successful');
        })
        .catch(error => {
          // Token is invalid, logout the user
          console.log('Token validation failed, logging out user:', error.response?.status);
          logout();
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Try the public endpoint first (temporary fix)
      const response = await api.post('/api/public/signin', credentials);
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
