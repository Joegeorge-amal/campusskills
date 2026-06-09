import React, { useState } from 'react';
import { IconMenu2, IconSearch, IconFilter, IconBell } from '@tabler/icons-react';
import Avatar from '../Avatar';
import NotificationPanel from './NotificationPanel';
import './AppHeader.css';

const AppHeader = ({
  title,
  setIsMobileMenuOpen,
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
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <IconMenu2 size={20} />
      </button>
      
      <div className="topbar-title">{title}</div>
      
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

        {showSearch && (
          <div className="search-input-wrapper">
            <IconSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>
        )}

        <div 
          className="header-icon-box" 
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        >
          <IconBell size={20} color="#6b7280" stroke={2} />
          {notificationCount > 0 && <div className="notification-badge">{notificationCount}</div>}
        </div>

        {isNotificationOpen && (
          <NotificationPanel 
            notifications={notifications || []} 
            onClose={() => setIsNotificationOpen(false)}
            onMarkAllRead={() => {
              if (markAllAsRead) markAllAsRead();
              setIsNotificationOpen(false);
            }}
          />
        )}

        {avatarData && (
          <div className="header-icon-box" onClick={onAvatarClick}>
            <Avatar 
              initials={avatarData.initials}
              bg="#eff6ff"
              color="#1e40af"
              backgroundImage={avatarData.backgroundImage}
              size="28px"
              fontSize="12px"
              style={{ borderRadius: '8px', fontWeight: 700 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
