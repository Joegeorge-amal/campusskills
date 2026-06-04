import React from 'react';
import './SessionCard.css';

const SessionCard = ({
  date,
  month,
  title,
  subtitle,
  status = 'upcoming', // 'upcoming', 'completed', 'cancelled', 'pending', 'live'
  actions
}) => {
  const isInactive = status === 'completed' || status === 'cancelled';
  const dateClass = isInactive ? 'sddt inactive' : 'sddt';

  return (
    <div className="sesscard">
      <div className={dateClass}>
        <div className="sdd">{date}</div>
        <div className="sdm">{month?.toUpperCase()}</div>
      </div>
      <div className="sesscard-info">
        <div className="sesscard-title">{title}</div>
        <div className="sesscard-subtitle">{subtitle}</div>
      </div>
      {actions && (
        <div className="sesscard-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SessionCard;
