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
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
    }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {type === 'incoming' && (
          <div style={{ marginTop: '2px' }}>
            <Avatar {...avatarProps} />
          </div>
        )}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', whiteSpace: 'pre-line' }}>
            {subtitle}
          </div>
          {tagText && (
              <span style={{ 
                fontSize: '11px', 
                padding: '4px 10px', 
                borderRadius: '100px', 
                background: tagType === 'success' ? '#ecfdf5' : '#eff6ff', 
                color: tagType === 'success' ? '#059669' : '#1d4ed8',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              {tagText}
            </span>
          )}
          
          {type === 'outgoing' && status.toLowerCase() === 'pending' && (
            <div style={{ marginTop: '12px' }}>
              <button 
                style={{ padding: '6px 16px', background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', alignSelf: type === 'incoming' ? 'center' : 'flex-start' }}>
        {type === 'incoming' && status === 'pending' && (
          <>
            <button 
              onClick={onAccept}
              style={{ padding: '6px 16px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
            >
              Accept
            </button>
            <button 
              onClick={onDecline}
              style={{ padding: '6px 16px', background: '#ffffff', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
            >
              Decline
            </button>
          </>
        )}
        
        {type === 'incoming' && status !== 'pending' && (
          <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontWeight: 700, fontSize: '12px' }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}

        {type === 'outgoing' && (
          <>
            <span style={{ 
              padding: '4px 12px', 
              background: status.toLowerCase() === 'confirmed' ? '#ecfdf5' : '#fef3c7', 
              color: status.toLowerCase() === 'confirmed' ? '#059669' : '#d97706', 
              borderRadius: '100px',  
              fontWeight: 600, 
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {status.toLowerCase() === 'pending' && '⏳'}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestsCardV2;
