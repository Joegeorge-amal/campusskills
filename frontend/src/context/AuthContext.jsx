import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('cs_role') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('cs_token'));
  const [avBg, setAvBg] = useState(() => localStorage.getItem('cs_av_bg') || '#EEEDFE');
  const [avCol, setAvCol] = useState(() => localStorage.getItem('cs_av_col') || '#3C3489');

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    try {
      const response = await authService.login(email, password);
      
      // Axios interceptor returns response.data
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) {
        throw new Error('Invalid response from server');
      }

      setUser(userData);
      setRole(userData.role?.toLowerCase() || 'student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(userData));
      localStorage.setItem('cs_role', userData.role?.toLowerCase() || 'student');
      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }
      localStorage.setItem('cs_av_bg', avBg);
      localStorage.setItem('cs_av_col', avCol);
      
      return true;
    } catch (error) {
      // Re-throw standardized error message
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const response = await authService.register(email, password, displayName);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) {
        throw new Error('Invalid response from server');
      }

      setUser(userData);
      setRole(userData.role?.toLowerCase() || 'student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(userData));
      localStorage.setItem('cs_role', userData.role?.toLowerCase() || 'student');
      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }
      localStorage.setItem('cs_av_bg', avBg);
      localStorage.setItem('cs_av_col', avCol);
      
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('cs_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    // If backend implements token revocation later, it goes here
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_role');
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_refresh_token');
    localStorage.removeItem('cs_av_bg');
    localStorage.removeItem('cs_av_col');
  };

  const changeAvColor = (bg, col) => {
    setAvBg(bg);
    setAvCol(col);
    localStorage.setItem('cs_av_bg', bg);
    localStorage.setItem('cs_av_col', col);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        avBg,
        avCol,
        login,
        register,
        updateProfile,
        logout,
        changeAvColor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
