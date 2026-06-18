import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMenu2, IconFilter, IconSun, IconMoon, IconUser, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import Avatar from '../Avatar';
import logo from '../../../assets/kju_campus_logo.png';
import NotificationDropdown from '../../notifications/NotificationDropdown';
import GlobalSearch from '../GlobalSearch/GlobalSearch';
import './AppHeader.css';

const AppHeader = ({
  title,
  setIsMobileMenuOpen,
  isCompact,
  setIsCompact,
  showSearch,
  chips,
  activeChip,
  setActiveChip,
  isAdvanced,
  setIsFilterModalOpen,
  avatarData,
  notificationCount,
  notifications,
  markAllAsRead,
  isAdminMode,
  onLogout
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    setIsProfileOpen(false);
    navigate('/app/profile');
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left-brand">
        <button 
          className="topbar-menu-btn" 
          onClick={() => {
            if (window.innerWidth <= 768) {
              setIsMobileMenuOpen(true);
            } else {
              setIsCompact(!isCompact);
            }
          }}
        >
          <IconMenu2 size={24} />
        </button>
        <img src={logo} alt="Campus Logo" className="topbar-university-logo" />
        <div className="topbar-brand-text">
          <div className="topbar-brand-name">Campus<span>Skills</span></div>
        </div>
      </div>
      
      {showSearch && !isNotificationOpen && (
        <GlobalSearch />
      )}

      <div className="topbar-actions">
        
        {isAdminMode && (
          <div className="admin-badge">
            Admin Mode
          </div>
        )}

        {isAdvanced && (
          <button className="filter-btn" onClick={() => setIsFilterModalOpen(true)}>
            <IconFilter size={14} /> Filters
          </button>
        )}

        {chips && chips.length > 0 && chips.map((c) => (
          <div 
            key={c}
            className={`filter-chip ${activeChip === c ? 'active' : ''}`}
            onClick={() => setActiveChip && setActiveChip(c)}
          >
            {c}
          </div>
        ))}

        <NotificationDropdown onToggle={(isOpen) => setIsNotificationOpen(isOpen)} />

        {avatarData && (
          <div className="profile-trigger" ref={dropdownRef}>
            <div 
              className="header-icon-box" 
              onClick={() => setIsProfileOpen((prev) => !prev)}
            >
              <Avatar 
                initials={avatarData.initials}
                bg="#eff6ff"
                color="#1e40af"
                backgroundImage={avatarData.backgroundImage}
                size="30px"
                fontSize="13px"
                style={{ 
                  borderRadius: '10px', 
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)'
                }}
              />
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dd-name">{avatarData.name}</div>
                  <div className="profile-dd-meta">{avatarData.meta}</div>
                </div>
                <div className="profile-dd-divider" />
                <button className="profile-dd-item" onClick={handleViewProfile}>
                  <IconUser size={16} stroke={1.5} />
                  <span>View Profile</span>
                </button>
                <button className="profile-dd-item" onClick={() => { setIsProfileOpen(false); toggleTheme(); }}>
                  {isDark ? <IconSun size={16} stroke={1.5} /> : <IconMoon size={16} stroke={1.5} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <div className="profile-dd-divider" />
                <button className="profile-dd-item profile-dd-signout" onClick={handleSignOut}>
                  <IconLogout size={16} stroke={1.5} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
