import React, { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import Avatar from './Avatar';

const SessionRequestPopup = ({ request, remainingCount, onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [request]);

  if (!request || !isVisible) return null;

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
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.5px' }}>NEW SESSION REQUEST</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {remainingCount > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '4px 10px', borderRadius: '100px' }}>
              +{remainingCount} more
            </span>
          )}
          <button onClick={onDecline} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
            <IconX size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Avatar initials={request.init || 'MK'} bg={request.bg || '#fce7f3'} color={request.col || '#9d174d'} size="48px" fontSize="16px" />
          <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: '#111827' }}>{request.name || 'Meera K.'}</div>
            <span style={{ color: '#6b7280' }}>Wants to book </span>
            <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{request.sub || 'Python & data analysis'}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            {request.type || '2nd yr · CSE · Online'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
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
        }} onClick={onAccept}>
          Accept
        </button>
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
        }} onClick={onDecline}>
          Dismiss
        </button>
      </div>
    </div>
    </>
  );
};

export default SessionRequestPopup;
