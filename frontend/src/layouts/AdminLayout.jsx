import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconAlertTriangle, 
  IconCalendarEvent, 
  IconChartBar,
  IconCurrencyRupee,
  IconSettings
} from '@tabler/icons-react';
import Toast from '../components/common/Toast';
import AdminNotifications from '../components/admin/AdminNotifications';
import logo from '../assets/kju_campus_logo.png';
import '../styles/admin.css';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <IconLayoutDashboard size={18} /> },
    { label: 'Users', path: '/admin/users', icon: <IconUsers size={18} /> },
    { label: 'Disputes', path: '/admin/reports', icon: <IconAlertTriangle size={18} />, badge: '3' },
    { label: 'Sessions', path: '/admin/sessions', icon: <IconCalendarEvent size={18} />, status: 'LIVE' },
    { label: 'Analytics', path: '/admin/analytics', icon: <IconChartBar size={18} /> },
    { label: 'Settings', path: '/admin/settings', icon: <IconSettings size={18} /> }
  ];

  return (
    <div className="admin-layout-top">
      {/* Top Dark Navbar */}
      <header className="admin-topnav">
        <div className="admin-topnav-left">
          <div className="admin-logo-group">
            <div className="admin-logo-circle">
              <img src={logo} alt="Logo" className="admin-logo-img" onError={(e) => e.target.style.display='none'} />
            </div>
            <div className="admin-brand-name">CampusSkills</div>
            <div className="admin-badge-pill">ADMIN</div>
          </div>
        </div>
        
        <div className="admin-topnav-right">
          <AdminNotifications />
          
          <div className="admin-user-profile">
            <div className="admin-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </div>
          
          <button className="admin-signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* Secondary Tab Bar */}
      <div className="admin-subnav-bar">
        <div className="admin-subnav-container">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <div 
                key={item.label}
                className={`admin-subnav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                onClick={() => !item.disabled && navigate(item.path)}
                style={{ cursor: item.disabled ? 'not-allowed' : 'pointer' }}
              >
                {item.icon}
                {item.label}
                {item.badge && <span className="subnav-badge">{item.badge}</span>}
                {item.status && <span className="subnav-status">{item.status}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="admin-main-content">
        <Outlet />
      </main>

      <Toast />
    </div>
  );
};

export default AdminLayout;
