import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Toast from '../components/common/Toast';
import Sidebar from '../components/common/Sidebar/Sidebar';
import AppHeader from '../components/common/AppHeader/AppHeader';
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconMessageCircle,
  IconClipboardList,
  IconCalendarEvent,
  IconWallet,
  IconHistory,
  IconUser
} from "@tabler/icons-react";

const AppLayout = () => {
  const { user, avBg, avCol, logout } = useAuth();
  const { unreadMessagesCount, pendingRequestsCount, notifications, markAllAsRead } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeChip, setActiveChip] = React.useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  // Reset active chip on navigation
  React.useEffect(() => {
    setActiveChip('');
  }, [location.pathname]);

  const getPageConfig = () => {
    const path = location.pathname;
    let config = { showSearch: true, chips: [], isAdvanced: false };
    
    if (path.includes('/app/dashboard')) {
      config.showSearch = true;
    } else if (path.includes('/app/marketplace')) {
      config.isAdvanced = true;
    } else if (path.includes('/app/messages')) {
      // no chips
    } else if (path.includes('/app/sessions')) {
      config.chips = ['All', 'Upcoming', 'Completed', 'Cancelled'];
    } else if (path.includes('/app/wallet')) {
      config.showSearch = false;
      config.chips = ['All', 'Credits', 'Debits'];
    } else if (path.includes('/app/profile') || path.includes('/app/edit-profile') || path.includes('/app/add-bank') || path.includes('/app/add-money') || path.includes('/app/withdraw') || path.includes('/app/payment') || path.includes('/app/swap-request')) {
      config.showSearch = false;
    }
    
    // Set default active chip
    if (config.chips.length > 0 && !activeChip && !['/app/profile', '/app/dashboard'].some(p => path.includes(p))) {
      setTimeout(() => setActiveChip(config.chips[0]), 0);
    }
    
    return config;
  };

  const { showSearch, chips, isAdvanced } = getPageConfig();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/app/dashboard')) return 'Dashboard';
    if (path.includes('/app/marketplace')) return 'Marketplace';
    if (path.includes('/app/messages')) return 'Messages';
    if (path.includes('/app/requests')) return 'Requests';
    if (path.includes('/app/sessions')) return 'Sessions';
    if (path.includes('/app/wallet')) return 'Wallet';
    if (path.includes('/app/history')) return 'History';
    if (path.includes('/app/profile')) return 'My profile';
    if (path.includes('/app/edit-profile')) return 'Edit profile';
    if (path.includes('/app/add-bank')) return 'Link bank account';
    if (path.includes('/app/add-money')) return 'Add money';
    if (path.includes('/app/withdraw')) return 'Withdraw to bank';
    if (path.includes('/app/payment')) return 'Pay for session';
    if (path.includes('/app/swap-request')) return 'Request skill swap';
    return 'Dashboard';
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: <IconLayoutDashboard />, section: 'Main' },
    { label: 'Marketplace', path: '/app/marketplace', icon: <IconShoppingBag /> },
    { label: 'Messages', path: '/app/messages', icon: <IconMessageCircle />, badge: unreadMessagesCount },
    { label: 'Requests', path: '/app/requests', icon: <IconClipboardList />, badge: pendingRequestsCount },
    { label: 'Sessions', path: '/app/sessions', icon: <IconCalendarEvent /> },
    { label: 'Wallet', path: '/app/wallet', icon: <IconWallet />, section: 'Finance' },
    { label: 'History', path: '/app/history', icon: <IconHistory /> },
    { label: 'My profile', path: '/app/profile', icon: <IconUser />, section: 'Me' }
  ];

  const sections = ['Main', 'Finance', 'Me'];
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK';

  const profileData = {
    initials,
    bg: avBg,
    color: avCol,
    backgroundImage: user?.avatarImg,
    name: user?.name || 'Arjun Kumar',
    meta: user ? `${user.year} · ${user.branch}` : '3rd yr · CSE',
    path: '/app/profile'
  };

  return (
    <div className="app">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems}
        sections={sections}
        brandIcon="cs"
        brandText="Campus"
        brandSpan="Skills"
        profileData={profileData}
        onLogout={handleSignOut}
      />

      <main className="main">
        <AppHeader 
          title={getPageTitle()}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          showSearch={showSearch}
          chips={chips}
          activeChip={activeChip}
          setActiveChip={setActiveChip}
          isAdvanced={isAdvanced}
          setIsFilterModalOpen={setIsFilterModalOpen}
          avatarData={profileData}
          notificationCount={notifications?.filter(n => n.unread).length || 0}
          notifications={notifications}
          markAllAsRead={markAllAsRead}
          isAdminMode={false}
          onAvatarClick={() => navigate('/app/profile')}
        />

        <div className="content">
          <Outlet />
        </div>
      </main>

      <Toast />

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a1560' }}>Filters</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', display: 'block', marginBottom: '8px' }}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['All', 'Design', 'Technology', 'Business'].map(c => (
                  <div key={c} className="filter-chip">{c}</div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', display: 'block', marginBottom: '8px' }}>Mode</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Any', 'Online', 'Offline'].map(c => (
                  <div key={c} className="filter-chip">{c}</div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', display: 'block', marginBottom: '8px' }}>Experience</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Any', 'Beginner', 'Intermediate', 'Expert'].map(c => (
                  <div key={c} className="filter-chip">{c}</div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsFilterModalOpen(false)}>Clear</button>
              <button style={{ padding: '8px 16px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsFilterModalOpen(false)}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
