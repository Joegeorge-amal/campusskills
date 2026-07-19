import React from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import './MarketplaceCard.css';

const MarketplaceCard = ({
  title,
  category,
  typeLabel,
  price,
  user,
  rating,
  sessionsCount,
  mode,
  isVerified,
  isSelected,
  onClick,
  description,
  skills,
  actionButtons,
  variant = 'marketplace'
}) => {
  const isPureRequesting = typeLabel === 'Requesting';

  // Determine category pill color class based on verification
  const getCategoryClass = () => {
    if (isPureRequesting) {
      return 'c-code';
    }
    return isVerified ? 'c-code' : 'c-warn';
  };

  const isSwap = typeof price === 'string' && price.toLowerCase().includes('swap');

  return (
    <div className={`mc-card ${isSelected ? 'selected' : ''} glossy-card`} onClick={onClick}>
      <div className="mc-header" style={{ alignItems: 'flex-start' }}>
        <div style={{display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0, paddingRight: '8px'}}>
          <div className={`cpill ${getCategoryClass()}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {category} {typeLabel && <><span style={{ opacity: 0.5, margin: '0 4px' }}>•</span>{typeLabel}</>}
          </div>
          {isVerified === true && variant === 'profile' && !isPureRequesting && (
            <div style={{fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '100px', border: '1px solid #a7f3d0', whiteSpace: 'nowrap', flexShrink: 0}}>
              ✓ Verified Skill
            </div>
          )}
          {isVerified === false && variant === 'profile' && !isPureRequesting && (
            <div style={{fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#fefce8', padding: '2px 8px', borderRadius: '100px', border: '1px solid #fde047', whiteSpace: 'nowrap', flexShrink: 0}}>
              ⚠️ Unverified
            </div>
          )}
        </div>
        <div className="mc-price" style={{ color: isSwap ? '#1d4ed8' : '#0F6E56', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
          {price}
        </div>
      </div>
      
      <div className="mc-title">
        {title}
      </div>
      
      {description && (
        <div className="mc-description" style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
          {description}
        </div>
      )}

      {skills && skills.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
          {skills.slice(0, 3).map((s, i) => (
            <span key={i} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--cs-bg-light)', color: 'var(--cs-text-secondary)', borderRadius: '100px', border: '1px solid var(--cs-border)', whiteSpace: 'nowrap' }}>
              {s.name || s}
            </span>
          ))}
          {skills.length > 3 && (
            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', borderRadius: '100px', border: '1px solid var(--cs-border)' }}>
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div 
        className="mc-user-info" 
        style={{ marginTop: 'auto', paddingTop: '12px', cursor: user?.id ? 'pointer' : 'default', textDecoration: user?.id ? 'underline' : 'none' }}
        onClick={(e) => {
          if (user?.id) {
            e.stopPropagation();
            window.location.href = `/app/user/${user.id}`;
          }
        }}
      >
        {[user?.name, user?.year, user?.branch].filter(Boolean).join(' · ')}
      </div>
      
      <div className="mc-footer" style={actionButtons ? { alignItems: 'flex-end' } : {}}>
        <div style={actionButtons ? { display: 'flex', flexDirection: 'column', gap: '6px' } : { display: 'contents' }}>
          <div className="mc-rating-block">
            <IconStarFilled className="mc-star-icon" />
            <span className="mc-rating-text">{rating}</span>
            <span className="mc-sessions-text">&middot; {sessionsCount} sessions</span>
          </div>
          <div className="mc-mode">
            <span className={`mc-dot ${mode.toLowerCase().includes('online') ? 'online' : 'offline'}`}></span> {mode}
          </div>
        </div>
        {actionButtons && (
          <div className="mc-actions" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCard;
