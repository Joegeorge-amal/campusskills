import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconMenu2, IconFilter, IconBell, IconSearch, IconX } from '@tabler/icons-react';
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const openMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(true);
    setMobileSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(false);
    setMobileSearchQuery('');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileSearchOpen) {
        closeMobileSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen, closeMobileSearch]);

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

        {showSearch && (
          <button
            className="mobile-search-btn header-icon-box"
            onClick={openMobileSearch}
            aria-label="Search"
          >
            <IconSearch size={20} />
          </button>
        )}

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

      {/* ─── MOBILE FULLSCREEN SEARCH OVERLAY ─── */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay" onClick={closeMobileSearch}>
          <div className="mobile-search-modal" onClick={e => e.stopPropagation()}>
            <div className="mobile-search-header">
              <div className="mobile-search-input-wrap">
                <IconSearch size={20} className="mobile-search-input-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="mobile-search-input"
                  placeholder="Search CampusSkills..."
                  value={mobileSearchQuery}
                  onChange={e => setMobileSearchQuery(e.target.value)}
                />
              </div>
              <button className="mobile-search-close" onClick={closeMobileSearch}>
                <IconX size={22} />
              </button>
            </div>
            {!mobileSearchQuery.trim() && (
              <div className="mobile-search-hints">
                <div className="mobile-search-hint-section">
                  <div className="mobile-search-hint-label">Popular skills</div>
                  <div className="mobile-search-hint-chips">
                    {['Web Dev', 'UI/UX', 'Python', 'Data Science', 'Design', 'Mobile Dev'].map(s => (
                      <button key={s} className="mobile-search-hint-chip" onClick={() => { setMobileSearchQuery(s); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppHeader;
