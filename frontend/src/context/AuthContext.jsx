import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { userService } from '../services/userService';

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
      const response = await userService.getMe();
      const fullData = response.data || response;
      if (fullData && fullData.user) {
        // Auto-unblock self if accidentally blocked
        let blockedUsers = fullData.user.blockedUsers || [];
        const selfId = fullData.user.userId || fullData.user._id || fullData.user.id;
        if (selfId && blockedUsers.includes(selfId)) {
          try {
            await userService.unblockUser(selfId);
            blockedUsers = blockedUsers.filter(id => id !== selfId);
            fullData.user.blockedUsers = blockedUsers;
          } catch (e) {
            console.error('Failed to auto-unblock self', e);
          }
        }

        setUser(prev => {
          const updated = { 
            ...prev, 
            ...fullData.user, 
            ...(fullData.profile || {}), 
            stats: fullData.stats, 
            wallet: fullData.wallet 
          };
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

      const response = await authService.login(email, password);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) throw new Error('Invalid response from server');

      // Set tokens immediately so subsequent getMe() works
      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // Fetch full profile mapping
      const profileRes = await userService.getMe();
      const fullData = profileRes.data || profileRes;
      const fullUser = {
        ...userData,
        ...(fullData.user || {}),
        ...(fullData.profile || {}),
        stats: fullData.stats,
        wallet: fullData.wallet
      };

      if (!userData.requiresOtp) {
        setUser(fullUser);
        setRole(fullUser.role?.toLowerCase() || 'student');
        setIsAuthenticated(true);
        
        localStorage.setItem('cs_user', JSON.stringify(fullUser));
        localStorage.setItem('cs_role', fullUser.role?.toLowerCase() || 'student');
        localStorage.setItem('cs_av_bg', avBg);
        localStorage.setItem('cs_av_col', avCol);
      }
      
      return fullUser;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authService.register(email, password, name);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) throw new Error('Invalid response from server');

      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // Fetch full profile mapping
      const profileRes = await userService.getMe();
      const fullData = profileRes.data || profileRes;
      const fullUser = {
        ...userData,
        ...(fullData.user || {}),
        ...(fullData.profile || {}),
        stats: fullData.stats,
        wallet: fullData.wallet
      };

      setUser(fullUser);
      setRole(fullUser.role?.toLowerCase() || 'student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(fullUser));
      localStorage.setItem('cs_role', fullUser.role?.toLowerCase() || 'student');
      localStorage.setItem('cs_av_bg', avBg);
      localStorage.setItem('cs_av_col', avCol);
      
      return fullUser;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const verifyEmail = async (otp) => {
    try {
      const response = await authService.verifyEmail(otp);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) throw new Error('Invalid response from server');

      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // Fetch full profile mapping
      const profileRes = await userService.getMe();
      const fullData = profileRes.data || profileRes;
      const fullUser = {
        ...userData,
        ...(fullData.user || {}),
        ...(fullData.profile || {}),
        stats: fullData.stats,
        wallet: fullData.wallet
      };

      setUser(fullUser);
      setRole(fullUser.role?.toLowerCase() || 'student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(fullUser));
      localStorage.setItem('cs_role', fullUser.role?.toLowerCase() || 'student');
      
      return fullUser;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Verification failed';
      throw new Error(msg);
    }
  };

  const verify2FA = async (otp) => {
    try {
      const response = await authService.verify2FA(otp);
      const data = response.data || response;
      const { token, refreshToken, user: userData } = data;

      if (!token) throw new Error('Invalid response from server');

      localStorage.setItem('cs_token', token);
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // Fetch full profile mapping
      const profileRes = await userService.getMe();
      const fullData = profileRes.data || profileRes;
      const fullUser = {
        ...userData,
        ...(fullData.user || {}),
        ...(fullData.profile || {}),
        stats: fullData.stats,
        wallet: fullData.wallet
      };

      setUser(fullUser);
      setRole(fullUser.role?.toLowerCase() || 'student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(fullUser));
      localStorage.setItem('cs_role', fullUser.role?.toLowerCase() || 'student');
      
      return fullUser;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || '2FA Verification failed';
      throw new Error(msg);
    }
  };

  const resend2FA = async () => {
    try {
      await authService.resend2FA();
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to resend 2FA OTP';
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
    // Optimistically clear local state for instant UI feedback
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_role');
    localStorage.removeItem('cs_token');
    
    try {
      const refreshToken = localStorage.getItem('cs_refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken).catch(err => console.error("Backend logout failed:", err));
      }
    } finally {
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
        verifyEmail,
        verify2FA,
        resend2FA,
        updateProfile,
        fetchProfile,
        logout,
        changeAvColor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
