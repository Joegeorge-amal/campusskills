import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Toast from '../components/common/Toast';
import Sidebar from '../components/common/Sidebar/Sidebar';
import AppHeader from '../components/common/AppHeader/AppHeader';
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconUsers,
  IconAlertTriangle,
  IconCalendarEvent
} from '@tabler/icons-react';

const AdminLayout = () => {
  const { user, avBg, avCol, logout } = useAuth();
  const { adminReports } = useAppData();
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
    
    if (path.includes('/admin/dashboard') || path.includes('/admin/analytics')) {
      config.showSearch = false;
    } else if (path.includes('/admin/users')) {
      config.chips = ['All', 'Active', 'Inactive', 'Verified', 'Suspended'];
    } else if (path.includes('/admin/sessions')) {
      config.chips = ['All', 'Scheduled', 'Active', 'Completed', 'Cancelled', 'Reported'];
    } else if (path.includes('/admin/reports')) {
      config.chips = ['All', 'Open', 'In Review', 'Resolved', 'High Priority'];
    } else if (path.includes('/admin/skills')) {
      config.isAdvanced = true;
    }
    
    if (config.chips.length > 0 && !activeChip) {
      setTimeout(() => setActiveChip(config.chips[0]), 0);
    }

    return config;
  };

  const { showSearch, chips, isAdvanced } = getPageConfig();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const openReportsCount = adminReports.filter(r => r.status === 'open').length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Overview';
    if (path.includes('/admin/skills')) return 'Posted Skills';
    if (path.includes('/admin/users')) return 'Students';
    if (path.includes('/admin/reports')) return 'Reports';
    if (path.includes('/admin/sessions')) return 'All Sessions';
    return 'Overview';
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <IconLayoutDashboard />, section: 'Overview' },
    { label: 'Posted Skills', path: '/admin/skills', icon: <IconBriefcase /> },
    { label: 'Students', path: '/admin/users', icon: <IconUsers /> },
    { label: 'Reports', path: '/admin/reports', icon: <IconAlertTriangle />, badge: openReportsCount, section: 'Moderation' },
    { label: 'All Sessions', path: '/admin/sessions', icon: <IconCalendarEvent /> }
  ];

  const sections = ['Overview', 'Moderation'];
  const initials = 'AD'; // Admin initials

  const profileData = {
    initials,
    bg: '#1a1560',
    color: '#ffffff',
    backgroundImage: null,
    name: 'Admin Panel',
    meta: 'PESU Bengaluru',
    path: null
  };

  return (
    <div className="app">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems}
        sections={sections}
        brandIcon="AD"
        brandText="campus"
        brandSpan="admin"
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
          notificationCount={openReportsCount}
          isAdminMode={true}
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
                {['All', 'Design', 'Technology', 'Business', 'Languages', 'Arts'].map(c => (
                  <div key={c} className="filter-chip">{c}</div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', display: 'block', marginBottom: '8px' }}>Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Any', 'Reported', 'Approved', 'Pending'].map(c => (
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

export default AdminLayout;
