import React from 'react';
import Avatar from './Avatar';

const RequestsCardV2 = ({
  avatarProps,
  title,
  subtitle,
  tagText,
  tagType = 'primary',
  status,
  type = 'incoming',
  onAccept,
  onDecline
}) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar {...avatarProps} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {subtitle}
            {tagText && (
              <span style={{ 
                fontSize: '11px', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                background: tagType === 'success' ? '#d1fae5' : '#e0e7ff', 
                color: tagType === 'success' ? '#059669' : '#4f46e5',
                fontWeight: 500
              }}>
                {tagText}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {type === 'incoming' && status === 'pending' && (
          <>
            <button 
              onClick={onAccept}
              style={{ padding: '6px 16px', background: '#d1fae5', color: '#059669', border: 'none', borderRadius: '20px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              Accept
            </button>
            <button 
              onClick={onDecline}
              style={{ padding: '6px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '20px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
            >
              Decline
            </button>
          </>
        )}
        
        {type === 'incoming' && status !== 'pending' && (
          <span style={{ padding: '4px 12px', background: '#d1fae5', color: '#059669', borderRadius: '20px', fontWeight: 500, fontSize: '12px' }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}

        {type === 'outgoing' && (
          <>
            <span style={{ 
              padding: '4px 12px', 
              background: status.toLowerCase() === 'confirmed' ? '#d1fae5' : '#fef08a', 
              color: status.toLowerCase() === 'confirmed' ? '#059669' : '#854d0e', 
              borderRadius: '20px', 
              fontWeight: 500, 
              fontSize: '12px' 
            }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {status.toLowerCase() === 'pending' && (
              <button style={{ padding: '6px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '20px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestsCardV2;
