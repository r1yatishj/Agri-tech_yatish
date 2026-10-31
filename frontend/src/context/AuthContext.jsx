import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agritech_token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios authorization header globally
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user profile on initial mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data.data;
    localStorage.setItem('agritech_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    return userData;
  };

  const register = async (formData) => {
    const res = await axios.post('/api/auth/register', formData);
    const { token: receivedToken, ...userData } = res.data.data;
    localStorage.setItem('agritech_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('agritech_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
