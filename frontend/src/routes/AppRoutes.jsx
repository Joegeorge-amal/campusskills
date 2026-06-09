import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/LoginPage';
import SetupPage from '../pages/SetupPage';
import LandingPage from '../pages/LandingPage';
import AppLayout from '../layouts/AppLayout';
import AdminLayout from '../layouts/AdminLayout';

// Student Pages
import Dashboard from '../pages/Dashboard';
import Marketplace from '../pages/Marketplace';
import Messages from '../pages/Messages';
import Requests from '../pages/Requests';
import Sessions from '../pages/Sessions';

import History from '../pages/History';
import Payment from '../pages/Payment';
import Withdraw from '../pages/Withdraw';
import AddMoney from '../pages/AddMoney';
import SwapRequest from '../pages/SwapRequest';
import AddBank from '../pages/AddBank';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import BookSessionRequest from '../pages/BookSessionRequest';

// Admin Pages
import AdminOverview from '../pages/admin/AdminOverview';
import AdminSkills from '../pages/admin/AdminSkills';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminReports from '../pages/admin/AdminReports';
import AdminSessions from '../pages/admin/AdminSessions';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they have the wrong role, send them to their respective dashboard
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/app/dashboard" replace />;
    }
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={role === 'admin' ? "/admin/dashboard" : "/app/dashboard"} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={role === 'admin' ? "/admin/dashboard" : "/app/dashboard"} replace /> : <LoginPage />} />
      <Route path="/setup" element={<SetupPage />} />
      
      {/* Student Layout */}
      <Route path="/app" element={
        <ProtectedRoute allowedRoles={['student', 'user']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="messages" element={<Messages />} />
        <Route path="requests" element={<Requests />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="history" element={<History />} />
        <Route path="payment" element={<Payment />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="add-money" element={<AddMoney />} />
        <Route path="swap-request" element={<SwapRequest />} />
        <Route path="add-bank" element={<AddBank />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="book-request" element={<BookSessionRequest />} />
      </Route>

      {/* Admin Layout */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="sessions" element={<AdminSessions />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
