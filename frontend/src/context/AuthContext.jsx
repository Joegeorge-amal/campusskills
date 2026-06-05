import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

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

  const fetchProfile = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await profileService.getMe();
      const profileData = response.data || response;
      if (profileData) {
        setUser(prev => {
          const updated = { ...prev, ...profileData };
          localStorage.setItem('cs_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to fetch latest profile:", error);
    }
  };

  // Fetch profile on initial mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const login = async (email, password, requestedRole = 'student') => {
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }

      // MOCK LOGIN FOR TESTING
      console.log('Mocking login for testing. Bypassing backend.');
      
      const mockRole = requestedRole;

      const userData = {
        id: 'mock-id-123',
        name: mockRole === 'admin' ? 'Admin User' : 'Student User',
        email: email,
        role: mockRole,
        meta: mockRole === 'admin' ? 'Admin Access' : '3rd yr CSE'
      };
      
      const token = 'mock-token-abc';
      const refreshToken = 'mock-refresh-xyz';

      setUser(userData);
      setRole(mockRole);
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(userData));
      localStorage.setItem('cs_role', mockRole);
      localStorage.setItem('cs_token', token);
      localStorage.setItem('cs_refresh_token', refreshToken);
      localStorage.setItem('cs_av_bg', avBg);
      localStorage.setItem('cs_av_col', avCol);
      
      return true;
    } catch (error) {
      const msg = error.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const response = await authService.register(email, password, displayName);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) throw new Error('Invalid response from server');

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

  const updateProfile = async (updatedFields) => {
    try {
      await profileService.updateMe(updatedFields);
      setUser((prev) => {
        const newUser = { ...prev, ...updatedFields };
        localStorage.setItem('cs_user', JSON.stringify(newUser));
        return newUser;
      });
      return true;
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('cs_refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken).catch(err => console.error("Backend logout failed:", err));
      }
    } finally {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem('cs_user');
      localStorage.removeItem('cs_role');
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_refresh_token');
      localStorage.removeItem('cs_av_bg');
      localStorage.removeItem('cs_av_col');
    }
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
