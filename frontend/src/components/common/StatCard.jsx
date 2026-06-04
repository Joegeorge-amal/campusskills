import React from 'react';
import './StatCard.css';

const StatCard = ({
  icon,
  iconBg = 'var(--cs-primary-light)',
  iconColor = 'var(--cs-primary)',
  value,
  label,
  subText = null,
  subColor = '#0F6E56',
  subIcon = null
}) => {
  return (
    <div className="scard">
      <div 
        className="scard-icon-wrapper"
        style={{
          background: iconBg,
          color: iconColor
        }}
      >
        {typeof icon === 'string' ? <i className={icon}></i> : icon}
      </div>
      <div className="scard-value">{value}</div>
      <div className="scard-label">{label}</div>
      {subText && (
        <div className="scard-sub" style={{ color: subColor }}>
          {subIcon && (typeof subIcon === 'string' ? <i className={subIcon}></i> : subIcon)}
          {subText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
