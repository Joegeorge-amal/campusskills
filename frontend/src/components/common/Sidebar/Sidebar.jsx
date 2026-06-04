import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Avatar from '../Avatar';
import './Sidebar.css';

const Sidebar = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  navItems, 
  sections, 
  brandIcon, 
  brandText, 
  brandSpan, 
  profileData, 
  onLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sb-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* SIDEBAR NAVIGATION */}
      <div className={`sb ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sb-logo">
          <div className="mark">{brandIcon}</div>
          <div className="wordmark">{brandText}<span>{brandSpan}</span></div>
        </div>
        
        <div className="sb-nav">
          {sections.map((sect) => (
            <React.Fragment key={sect}>
              <div className="sxn">{sect}</div>
              {navItems
                .filter((item) => item.section === sect || (!item.section && sect === sections[0]))
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
            className="sb-profile-btn"
            onClick={() => { 
              if (profileData.path) {
                navigate(profileData.path); 
                setIsMobileMenuOpen(false); 
              }
            }}
          >
            <Avatar 
              initials={profileData.initials}
              bg={profileData.bg}
              color={profileData.color}
              backgroundImage={profileData.backgroundImage}
              size="27px"
              fontSize="10px"
            />
            <div className="sb-profile-info">
              <div className="sb-profile-name">
                {profileData.name}
              </div>
              <div className="sb-profile-meta">
                {profileData.meta}
              </div>
            </div>
          </div>
          
          <button onClick={onLogout} className="sb-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
