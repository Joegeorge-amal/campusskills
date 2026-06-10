import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconLogout } from '@tabler/icons-react';
import './Sidebar.css';

const Sidebar = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  isCompact,
  navItems, 
  sections, 
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
      <div 
        className={`sb ${isMobileMenuOpen ? 'open' : ''} ${isCompact ? 'compact' : ''}`}
      >
        
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
                      {item.icon}<span className="ni-label">{item.label}</span>
                      {item.badge > 0 && <span className="nbdg">{item.badge}</span>}
                    </button>
                  );
                })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="sb-foot">
          <button onClick={onLogout} className="sb-logout-btn">
            <IconLogout size={20} stroke={1.5} /><span className="sb-logout-btn-text">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
