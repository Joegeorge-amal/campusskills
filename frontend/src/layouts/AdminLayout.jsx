import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconAlertTriangle, 
  IconCalendarEvent, 
  IconBook,
  IconLogout
} from '@tabler/icons-react';
import Toast from '../components/common/Toast';
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
    { label: 'Overview', path: '/admin/dashboard', icon: <IconLayoutDashboard size={20} /> },
    { label: 'Users', path: '/admin/users', icon: <IconUsers size={20} /> },
    { label: 'Disputes', path: '/admin/reports', icon: <IconAlertTriangle size={20} /> },
    { label: 'Sessions', path: '/admin/sessions', icon: <IconCalendarEvent size={20} /> },
    { label: 'Skills', path: '/admin/skills', icon: <IconBook size={20} /> }
  ];

  const currentNav = navItems.find(item => location.pathname.includes(item.path)) || navItems[0];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo-mark">CS</div>
          <div className="admin-brand-text">
            Campus<span>Admin</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleSignOut}>
            <IconLogout size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="admin-content-wrapper">
        
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-breadcrumb">{currentNav.label}</span>
          </div>
          
          <div className="admin-topbar-right">
            <div className="admin-profile">
              <div className="admin-profile-text" style={{ textAlign: 'right' }}>
                <span className="admin-profile-name">{user?.name || 'Administrator'}</span>
                <span className="admin-profile-role">Super Admin</span>
              </div>
              <div style={{ width: '36px', height: '36px', background: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main View */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default AdminLayout;
