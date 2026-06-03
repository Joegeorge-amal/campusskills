import React, { createContext, useState, useContext, useEffect } from 'react';

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
    // 1. Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Mock Validation (Any email/pass works, just ensure they exist)
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // 3. Determine role based on email
    const isMockAdmin = email.toLowerCase().includes('admin');
    const assignedRole = isMockAdmin ? 'admin' : 'student';

    // 4. Setup mock data based on role
    if (assignedRole === 'student') {
      const mockStudent = {
        id: "demo-student-user",
        email: email,
        fname: 'Arjun',
        lname: 'Kumar',
        name: 'Arjun Kumar',
        year: '3rd year',
        branch: 'CSE',
        college: 'PESU Bengaluru',
        upi: 'arjunkumar@upi',
        bio: 'DSA enthusiast. Love helping juniors crack placements. Also learning Figma on the side.',
        trustScore: '4.8',
        skillsOffered: ['DSA', 'C++ basics'],
        skillsWanted: ['Figma', 'Japanese'],
        walletBalance: 840,
        avatarImg: null,
        role: 'student'
      };
      setUser(mockStudent);
      setRole('student');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(mockStudent));
      localStorage.setItem('cs_role', 'student');
      localStorage.setItem('cs_token', 'mock-jwt-token-xyz');
      localStorage.setItem('cs_av_bg', avBg);
      localStorage.setItem('cs_av_col', avCol);
    } else {
      const mockAdmin = {
        id: "demo-admin-user",
        email: email,
        name: 'PESU Admin',
        college: 'PESU Bengaluru',
        role: 'admin'
      };
      setUser(mockAdmin);
      setRole('admin');
      setIsAuthenticated(true);
      
      localStorage.setItem('cs_user', JSON.stringify(mockAdmin));
      localStorage.setItem('cs_role', 'admin');
      localStorage.setItem('cs_token', 'mock-jwt-admin-token-xyz');
    }

    return true;
  };

  const completeSetup = (setupData) => {
    const name = `${setupData.fname} ${setupData.lname}`.trim() || 'Arjun Kumar';
    const completeUser = {
      email: setupData.email || 'yourname@college.edu',
      fname: setupData.fname || 'Arjun',
      lname: setupData.lname || 'Kumar',
      name: name,
      year: setupData.year || '3rd year',
      branch: setupData.branch || 'CSE',
      college: setupData.college || 'PESU Bengaluru',
      upi: setupData.upi || 'yourname@upi',
      bio: setupData.bio || 'Tell others what you\'re passionate about...',
      trustScore: '4.8',
      skillsOffered: setupData.skillsOffered || ['DSA', 'C++'],
      skillsWanted: setupData.skillsWanted || ['Figma', 'Japanese'],
      walletBalance: 840,
      avatarImg: setupData.avatarImg || null
    };
    setUser(completeUser);
    setRole('student');
    setIsAuthenticated(true);
    localStorage.setItem('cs_user', JSON.stringify(completeUser));
    localStorage.setItem('cs_role', 'student');
    localStorage.setItem('cs_token', 'mock-jwt-token-xyz');
    localStorage.setItem('cs_av_bg', avBg);
    localStorage.setItem('cs_av_col', avCol);
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('cs_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_role');
    localStorage.removeItem('cs_token');
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
        completeSetup,
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
