import React from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import './MarketplaceCard.css';

const MarketplaceCard = ({
  title,
  category,
  price,
  user,
  rating,
  sessionsCount,
  mode,
  isSelected,
  onClick
}) => {
  // Determine category pill color class
  const getCategoryClass = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('code') || c.includes('coding')) return 'c-code';
    if (c.includes('design')) return 'c-des';
    if (c.includes('lang')) return 'c-lan';
    if (c.includes('math')) return 'c-mat';
    if (c.includes('music')) return 'c-mus';
    return 'c-mus'; // Default
  };

  return (
    <div className={`mc-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="mc-header">
        <div className={`cpill ${getCategoryClass(category)}`}>
          {category}
        </div>
        <div className="mc-price">
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
          <span className="mc-dot">&bull;</span> {mode}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
