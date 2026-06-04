import React from 'react';
import { IconMenu2, IconSearch, IconFilter, IconBell } from '@tabler/icons-react';
import Avatar from '../Avatar';
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
  isAdminMode,
  onAvatarClick
}) => {
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

        <div className="notification-bell">
          <IconBell />
          {notificationCount > 0 && <div className="notification-dot"></div>}
        </div>

        {avatarData && (
          <Avatar 
            initials={avatarData.initials}
            bg={avatarData.bg}
            color={avatarData.color}
            backgroundImage={avatarData.backgroundImage}
            size="29px"
            fontSize="11px"
            onClick={onAvatarClick}
            style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
          />
        )}
      </div>
    </div>
  );
};

export default AppHeader;
