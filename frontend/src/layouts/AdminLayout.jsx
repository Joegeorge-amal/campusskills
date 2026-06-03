import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import Toast from '../components/common/Toast';
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconUsers,
  IconAlertTriangle,
  IconCalendarEvent,
  IconSearch,
  IconBell,
  IconUser,
  IconMenu2,
  IconFilter
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

  return (
    <div className="app">
      {/* Mobile Overlay */}
      <div 
        className={`sb-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* SIDEBAR NAVIGATION */}
      <div className={`sb ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sb-logo">
          <div className="mark">AD</div>
          <div className="wordmark">campus<span>admin</span></div>
        </div>
        
        <div className="sb-nav">
          {sections.map((sect) => (
            <React.Fragment key={sect}>
              <div className="sxn">{sect}</div>
              {navItems
                .filter((item) => item.section === sect || (!item.section && sect === 'Overview'))
                .map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button 
                      key={item.label}
                      className={`ni ${isActive ? 'on' : ''}`}
                      onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                    >
                      {item.icon} 
                      {item.label}
                      {item.badge > 0 && <span className="nbdg">{item.badge}</span>}
                    </button>
                  );
                })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="sb-foot">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 9px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Avatar 
              initials={initials}
              bg="#1a1560"
              color="#ffffff"
              size="27px"
              fontSize="10px"
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin Panel
              </div>
              <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                PESU Bengaluru
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '7px 9px',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              fontSize: '12px',
              color: '#E24B4A',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN PANEL CONTENT */}
      <main className="main">
        <div className="topbar">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px', color: '#555', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconMenu2 size={20} />
          </button>
          
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{getPageTitle()}</div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            
            {/* Admin Badge */}
            <div style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#FFF3CD', color: '#7A5800', fontWeight: 500, border: '1px solid #F0C040', whiteSpace: 'nowrap', marginRight: '4px' }}>
              Admin Mode
            </div>

            {/* Advanced Filters Button */}
            {isAdvanced && (
              <button className="filter-btn" onClick={() => setIsFilterModalOpen(true)}>
                <IconFilter size={14} /> Filters
              </button>
            )}

            {/* Filter Chips */}
            {chips.length > 0 && chips.map((c) => (
              <div 
                key={c}
                className={`filter-chip ${activeChip === c ? 'active' : ''}`}
                onClick={() => setActiveChip(c)}
              >
                {c}
              </div>
            ))}

            {/* Search bar */}
            {showSearch && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F5F4FF',
                  border: '0.5px solid rgba(0,0,0,.08)',
                  borderRadius: '8px',
                  padding: '5px 9px',
                  flexShrink: 0
                }}
              >
                <IconSearch style={{ fontSize: '12px', color: '#aaa' }} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', color: '#222', width: '100px' }}
                />
              </div>
            )}

            {/* Notification icon */}
            <div 
              style={{
                width: '29px',
                height: '29px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#888',
                fontSize: '15px',
                border: '0.5px solid rgba(0,0,0,.08)',
                background: '#fff',
                position: 'relative',
                marginLeft: '6px'
              }}
            >
              <IconBell />
              {openReportsCount > 0 && <div style={{ width: '6px', height: '6px', background: '#E24B4A', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>}
            </div>

            {/* Top avatar indicator */}
            <Avatar 
              initials={initials}
              bg="#1a1560"
              color="#ffffff"
              size="29px"
              fontSize="11px"
            />
          </div>
        </div>

        {/* DYNAMIC SCENE CONTAINER */}
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
