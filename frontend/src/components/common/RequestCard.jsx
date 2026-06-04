import React from 'react';
import Avatar from './Avatar';
import './RequestCard.css';

const RequestCard = ({
  avatarProps,
  title,
  subtitle,
  tagText,
  tagType = 'primary', // 'primary', 'success', 'warning'
  status,
  type = 'incoming', // 'incoming', 'outgoing'
  onAccept,
  onDecline
}) => {
  // Determine tag CSS classes based on tagType
  let tagClass = 'rc-tag-primary';
  if (tagType === 'success') tagClass = 'rc-tag-success';
  if (tagType === 'warning') tagClass = 'rc-tag-warning';

  return (
    <div className="req-card">
      <div className="req-card-avatar">
        <Avatar {...avatarProps} />
      </div>
      
      <div className="req-card-info">
        <div className="req-card-title">{title}</div>
        <div className="req-card-subtitle">{subtitle}</div>
        {tagText && (
          <div className="req-card-tag-wrapper">
            <span className={`req-card-tag ${tagClass}`}>
              {tagText}
            </span>
          </div>
        )}
      </div>

      <div className="req-card-actions">
        {type === 'incoming' && status === 'pending' && (
          <div className="req-card-btn-group">
            <button className="req-card-btn-accept" onClick={onAccept}>Accept</button>
            <button className="req-card-btn-decline" onClick={onDecline}>Decline</button>
          </div>
        )}
        
        {type === 'incoming' && status !== 'pending' && (
          <span className="req-card-status-pill success">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}

        {type === 'outgoing' && (
          <span className={`req-card-status-pill ${status.toLowerCase() === 'confirmed' ? 'success' : 'warning'}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
