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
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ marginTop: '2px' }}>
          <Avatar {...avatarProps} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            {subtitle}
          </div>
          {tagText && (
            <span style={{ 
              fontSize: '12px', 
              padding: '4px 10px', 
              borderRadius: '16px', 
              background: tagType === 'success' ? '#e6f4ea' : '#e8eaf6', 
              color: tagType === 'success' ? '#1e8e3e' : '#5c6bc0',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              {tagText}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {type === 'incoming' && status === 'pending' && (
          <>
            <button 
              onClick={onAccept}
              style={{ padding: '8px 20px', background: '#e6f4ea', color: '#1e8e3e', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#d3ebd9' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#e6f4ea' }}
            >
              Accept
            </button>
            <button 
              onClick={onDecline}
              style={{ padding: '8px 20px', background: '#ffffff', color: '#5f6368', border: '1px solid #dadce0', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f8f9fa' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
            >
              Decline
            </button>
          </>
        )}
        
        {type === 'incoming' && status !== 'pending' && (
          <span style={{ padding: '6px 16px', background: '#e6f4ea', color: '#1e8e3e', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}

        {type === 'outgoing' && (
          <>
            <span style={{ 
              padding: '6px 16px', 
              background: status.toLowerCase() === 'confirmed' ? '#e6f4ea' : '#fef08a', 
              color: status.toLowerCase() === 'confirmed' ? '#1e8e3e' : '#854d0e', 
              borderRadius: '16px', 
              fontWeight: 600, 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {status.toLowerCase() === 'pending' && '⏳'}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {status.toLowerCase() === 'pending' && (
              <button 
                style={{ padding: '8px 20px', background: '#ffffff', color: '#5f6368', border: '1px solid #dadce0', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8f9fa' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
              >
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
