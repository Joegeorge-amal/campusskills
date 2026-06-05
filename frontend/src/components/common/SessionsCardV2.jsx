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
    <div style={{
      display: 'flex',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      opacity: isInactive ? 0.6 : 1
    }}>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        minWidth: '56px'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{date}</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginTop: '4px' }}>{month?.toUpperCase()}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>{subtitle}</div>
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
