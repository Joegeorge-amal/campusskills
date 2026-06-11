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
  onClick
}) => {
  // Determine category pill color class
  const getCategoryClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('code') || c.includes('coding')) return 'c-code';
    if (c.includes('design')) return 'c-des';
    if (c.includes('lang')) return 'c-lan';
    if (c.includes('math')) return 'c-mat';
    if (c.includes('music')) return 'c-mus';
    return 'c-mus'; // Default
  };

  const isSwap = typeof price === 'string' && price.toLowerCase().includes('swap');

  return (
    <div className={`mc-card ${isSelected ? 'selected' : ''} glossy-card`} onClick={onClick}>
      <div className="mc-header">
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <div className={`cpill ${getCategoryClass(category)}`}>
            {category} {typeLabel && <><span style={{ opacity: 0.5, margin: '0 4px' }}>•</span>{typeLabel}</>}
          </div>
          {isVerified && (
            <div style={{fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0'}}>
              ✓ Verified Skill
            </div>
          )}
        </div>
        <div className="mc-price" style={{ color: isSwap ? '#1d4ed8' : '#0F6E56' }}>
          {price}
        </div>
      </div>
      
      <div className="mc-title">
        {title}
      </div>
      
      <div className="mc-user-info">
        {user.name} &middot; {user.year} &middot; {user.branch}
      </div>
      
      <div className="mc-footer">
        <div className="mc-rating-block">
          <IconStarFilled className="mc-star-icon" />
          <span className="mc-rating-text">{rating}</span>
          <span className="mc-sessions-text">&middot; {sessionsCount} sessions</span>
        </div>
        <div className="mc-mode">
          <span className={`mc-dot ${mode.toLowerCase().includes('online') ? 'online' : 'offline'}`}></span> {mode}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
