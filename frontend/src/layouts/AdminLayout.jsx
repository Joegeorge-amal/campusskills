import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { IconSun, IconMoon, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconAlertTriangle, 
  IconCalendarEvent, 
  IconChartBar,
  IconCurrencyRupee,
  IconSettings,
  IconBook,
  IconShieldCheck
} from '@tabler/icons-react';
import Toast from '../components/common/Toast';
import AdminNotifications from '../components/admin/AdminNotifications';
import logo from '../assets/kju_campus_logo.png';
import '../styles/admin.css';
import adminService from '../services/adminService';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  const [disputeCount, setDisputeCount] = useState(0);
  const [hasLiveSessions, setHasLiveSessions] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [disputesRes, sessionsRes] = await Promise.all([
          adminService.getDisputes({ limit: 1 }),
          adminService.getSessions({ status: 'LIVE', limit: 1 })
        ]);
        
        const openDisputesRes = await adminService.getDisputes({ status: 'OPEN', limit: 1 });
        setDisputeCount(openDisputesRes?.pagination?.total || 0);
        
        setHasLiveSessions((sessionsRes?.pagination?.total || 0) > 0);
      } catch (err) {
        console.error('Failed to fetch admin layout stats:', err);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <IconLayoutDashboard size={18} /> },
    { label: 'Users', path: '/admin/users', icon: <IconUsers size={18} /> },
    { label: 'User Reports', path: '/admin/user-reports', icon: <IconShieldCheck size={18} /> },
    { label: 'Disputes', path: '/admin/reports', icon: <IconAlertTriangle size={18} />, badge: disputeCount > 0 ? disputeCount.toString() : null },
    { label: 'Listings', path: '/admin/listings', icon: <IconBook size={18} /> },
    { label: 'Sessions', path: '/admin/sessions', icon: <IconCalendarEvent size={18} />, status: hasLiveSessions ? 'LIVE' : null },
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
          
          <div className="admin-user-profile" ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsProfileOpen((prev) => !prev)}>
            <div className="admin-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-user-role">Super Admin</span>
            </div>

            {isProfileOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                zIndex: 200,
                overflow: 'hidden',
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); toggleTheme(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '12px 16px', border: 'none', background: 'none',
                    fontSize: 13, fontWeight: 500, color: '#0f172a', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <div style={{ height: '0.5px', background: '#e2e8f0' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); handleSignOut(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '12px 16px', border: 'none', background: 'none',
                    fontSize: 13, fontWeight: 500, color: '#ef4444', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <IconLogout size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
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
