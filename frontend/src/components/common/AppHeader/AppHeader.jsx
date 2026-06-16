import React, { useState } from 'react';
import { IconMenu2, IconFilter, IconBell } from '@tabler/icons-react';
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
  onAvatarClick
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
      
      {/* Title removed per user request */}
      {/* Title removed per user request */}
      
      {showSearch && (
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



        <NotificationDropdown />

        {avatarData && (
          <div className="header-icon-box" onClick={onAvatarClick}>
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
        )}
      </div>
    </div>
  );
};

export default AppHeader;
