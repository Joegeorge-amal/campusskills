import React from 'react';

const SessionsCardV2 = ({
  date,
  month,
  title,
  subtitle,
  status = 'upcoming',
  actions,
  variant = 'default'
}) => {
  const isInactive = status === 'completed' || status === 'cancelled';
  
  return (
    <div className="glossy-card" style={{
      display: 'flex',
      background: '#ffffff',
      border: '1px solid #f3f4f6',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      alignItems: 'center'
    }}>
      <div style={{
        background: isInactive ? '#f3f4f6' : '#eff6ff',
        borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        minWidth: '50px',
        height: '52px',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: isInactive ? '#111827' : '#1d4ed8', lineHeight: 1 }}>{date}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: isInactive ? '#6b7280' : '#1d4ed8', marginTop: '4px', letterSpacing: '0.5px' }}>{month?.toUpperCase()}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>{subtitle}</div>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default SessionsCardV2;
