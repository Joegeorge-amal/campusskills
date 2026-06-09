import React from 'react';
import Avatar from './Avatar';
import './ChatListItem.css';

const ChatListItem = ({
  avatarProps,
  isOnline,
  name,
  preview,
  time,
  unreadCount,
  isActive,
  variant = 'default',
  onClick
}) => {
  const className = `chat-li ${isActive ? 'active' : ''} chat-li-${variant}`;
  return (
    <div className={className} onClick={onClick}>
      <div className="chat-li-avatar-wrapper">
        <Avatar {...avatarProps} />
        {isOnline && <div className="chat-li-dot-on"></div>}
      </div>
      <div className="chat-li-info">
        <div className="chat-li-name">{name}</div>
        <div className="chat-li-preview">{preview}</div>
      </div>
      <div className="chat-li-meta">
        <div className="chat-li-time">{time}</div>
        {unreadCount > 0 && (
          <div className="chat-li-unread">{unreadCount}</div>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
