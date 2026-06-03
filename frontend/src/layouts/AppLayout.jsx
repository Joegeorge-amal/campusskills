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
  IconMenu2
} from "@tabler/icons-react";
import { IconSearch, IconBell } from '@tabler/icons-react';

const AppLayout = () => {
  const { user, avBg, avCol, logout } = useAuth();
  const { unreadMessagesCount, pendingRequestsCount } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
            
            {/* Search bar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#F5F4FF',
                border: '0.5px solid rgba(0,0,0,.08)',
                borderRadius: '8px',
                padding: '5px 9px'
              }}
            >
              <IconSearch style={{ fontSize: '12px', color: '#aaa' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', color: '#222', width: '100px' }}
              />
            </div>

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
    </div>
  );
};

export default AppLayout;
