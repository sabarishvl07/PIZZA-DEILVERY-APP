import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios base URL for backend connection
  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Set Auth header globally
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      return { success: true, message: res.data.message, emailPreview: res.data.emailPreview, devMode: res.data.devMode };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
