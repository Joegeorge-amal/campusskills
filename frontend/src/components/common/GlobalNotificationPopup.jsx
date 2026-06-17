import React, { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import Avatar from './Avatar';

const GlobalNotificationPopup = ({ 
  title, 
  subtitle, 
  badge,
  badgeColor = '#1d4ed8', 
  avatarInitials, 
  avatarBg, 
  avatarColor,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  onClose,
  autoCloseMs = 0,
  children
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    let timer;
    if (autoCloseMs > 0) {
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseMs);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoCloseMs, onClose, title]); // Reset when title changes (new popup)

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRightPopup {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        width: '360px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '20px',
        zIndex: 9998,
        border: '1px solid #f3f4f6',
        animation: 'slideInRightPopup 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: badgeColor, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {badge || 'NOTIFICATION'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              <IconX size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {avatarInitials && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar initials={avatarInitials} bg={avatarBg || '#fce7f3'} color={avatarColor || '#9d174d'} size="48px" fontSize="16px" />
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></div>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: 700, marginBottom: '4px', lineHeight: 1.4 }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>
                {subtitle}
              </div>
            )}
            {children}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {primaryButtonText && (
            <button style={{
              flex: 1,
              padding: '10px 0',
              background: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }} onClick={onPrimaryClick}>
              {primaryButtonText}
            </button>
          )}
          {secondaryButtonText && (
            <button style={{
              flex: 1,
              padding: '10px 0',
              background: '#ffffff',
              color: '#1d4ed8',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }} onClick={onSecondaryClick}>
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GlobalNotificationPopup;
