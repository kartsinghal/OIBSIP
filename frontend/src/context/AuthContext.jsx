import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Validate token and fetch current user profile on load
  const loadUser = useCallback(async (authToken) => {
    try {
      if (!authToken) {
        setLoading(false);
        return;
      }
      const response = await apiClient.get('/auth/me');
      if (response.data?.success) {
        setUser(response.data.data);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser(token);
  }, [token, loadUser]);

  const sendOtp = useCallback(async (phone) => {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  }, []);

  const verifyOtp = useCallback(async (phone, code) => {
    const response = await apiClient.post('/auth/verify-otp', { phone, code });
    if (response.data?.success && response.data.token) {
      login(response.data.token, response.data.data);
    }
    return response.data;
  }, [login]);

  const googleLogin = useCallback(async (email, name, avatar) => {
    const response = await apiClient.post('/auth/google', { email, name, avatar });
    if (response.data?.success && response.data.token) {
      login(response.data.token, response.data.data);
    }
    return response.data;
  }, [login]);

  const updateProfile = useCallback(async (fullName, email) => {
    const response = await apiClient.put('/auth/profile', { fullName, email });
    if (response.data?.success && response.data.data) {
      setUser(response.data.data);
    }
    return response.data;
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    sendOtp,
    verifyOtp,
    googleLogin,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
