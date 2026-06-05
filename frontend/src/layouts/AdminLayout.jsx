import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconX } from '@tabler/icons-react';
import Toast from '../components/common/Toast';
import '../styles/admin.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Disputes', path: '/admin/reports' }, // Map "Reports" to "Disputes"
    { label: 'Sessions', path: '/admin/sessions' }
  ];

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo-mark">cs</div>
          <div className="admin-brand-text">
            Campus<span>Skills</span>
          </div>
          <div className="admin-badge">Admin</div>
        </div>
        <button className="admin-logout-btn" onClick={handleSignOut}>
          <IconX size={16} />
          Log Out
        </button>
      </header>

      {/* Sub Navigation */}
      <nav className="admin-subnav">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`admin-nav-link ${location.pathname.includes(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>

      <Toast />
    </div>
  );
};

export default AdminLayout;
