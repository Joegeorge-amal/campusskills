import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import Toast from '../components/common/Toast';
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconMessageCircle,
  IconClipboardList,
  IconCalendarEvent,
  IconWallet,
  IconHistory,
  IconUser,
  IconMenu2,
  IconFilter
} from "@tabler/icons-react";
import { IconSearch, IconBell } from '@tabler/icons-react';

const AppLayout = () => {
  const { user, avBg, avCol, logout } = useAuth();
  const { unreadMessagesCount, pendingRequestsCount } = useAppData();
  const navigate = useNavigate();
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
      config.showSearch = false;
    } else if (path.includes('/app/marketplace')) {
      config.isAdvanced = true;
    } else if (path.includes('/app/messages')) {
      config.chips = ['All', 'Unread', 'Active', 'Archived'];
    } else if (path.includes('/app/requests')) {
      config.chips = ['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'];
    } else if (path.includes('/app/sessions')) {
      config.chips = ['All', 'Upcoming', 'Completed', 'Cancelled'];
    } else if (path.includes('/app/wallet')) {
      config.showSearch = false;
      config.chips = ['All', 'Credits', 'Debits'];
    } else if (path.includes('/app/history')) {
      config.chips = ['Sessions', 'Wallet', 'Exchanges'];
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
          <div className="mark">cs</div>
          <div className="wordmark">campus<span>skills</span></div>
        </div>
        
        <div className="sb-nav">
          {sections.map((sect) => (
            <React.Fragment key={sect}>
              <div className="sxn">{sect}</div>
              {navItems
                .filter((item) => item.section === sect || (!item.section && sect === 'Main'))
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
            onClick={() => { navigate('/app/profile'); setIsMobileMenuOpen(false); }}
          >
            <Avatar 
              initials={initials}
              bg={avBg}
              color={avCol}
              backgroundImage={user?.avatarImg}
              size="27px"
              fontSize="10px"
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Arjun Kumar'}
              </div>
              <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user ? `${user.year} · ${user.branch}` : '3rd yr · CSE'}
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
                position: 'relative'
              }}
            >
              <IconBell />
              <div style={{ width: '6px', height: '6px', background: '#E24B4A', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
            </div>

            {/* Top avatar indicator */}
            <Avatar 
              initials={initials}
              bg={avBg}
              color={avCol}
              backgroundImage={user?.avatarImg}
              size="29px"
              fontSize="11px"
              onClick={() => navigate('/app/profile')}
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
