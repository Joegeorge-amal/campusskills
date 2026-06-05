import React from 'react';
import { IconX } from '@tabler/icons-react';
import Avatar from './Avatar';

const SessionRequestPopup = ({ request, remainingCount, onAccept, onDecline }) => {
  if (!request) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '24px',
      right: '24px',
      width: '360px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '20px',
      zIndex: 100,
      border: '1px solid #f3f4f6'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#534AB7' }}></div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#534AB7', letterSpacing: '0.5px' }}>NEW SESSION REQUEST</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {remainingCount > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#534AB7', background: '#f5f3ff', padding: '4px 8px', borderRadius: '100px' }}>
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
          <Avatar initials={request.init} bg={request.bg} color={request.col} size="48px" fontSize="16px" />
          <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#1D9E75', border: '2px solid white', borderRadius: '50%' }}></div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{request.name} </span>
            {request.sub ? request.sub : 'wants to book a session'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {request.type || 'Student · Online'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{
          flex: 1,
          padding: '10px 0',
          background: '#534AB7',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }} onClick={onAccept}>
          Accept
        </button>
        <button style={{
          flex: 1,
          padding: '10px 0',
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }} onClick={onDecline}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default SessionRequestPopup;
