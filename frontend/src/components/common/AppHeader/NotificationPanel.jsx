import React, { useState } from 'react';
import { IconCheck, IconX, IconCalendarEvent, IconBell, IconMessage, IconTrash } from '@tabler/icons-react';
import './NotificationPanel.css';

const getIconForType = (type) => {
  switch (type) {
    case 'NEW_MESSAGE':
      return { icon: <IconMessage size={18} stroke={2} />, bg: '#f0f7ff', color: '#3b82f6' }; // Blue
    case 'SESSION_ACCEPTED':
    case 'SESSION_COMPLETED':
    case 'EXCHANGE_REQUEST_ACCEPTED':
    case 'CHAT_REQUEST_ACCEPTED':
      return { icon: <IconCheck size={18} stroke={2} />, bg: '#ecfdf5', color: '#10b981' }; // Green
    case 'SESSION_CANCELLED':
    case 'SESSION_REJECTED':
    case 'EXCHANGE_REQUEST_REJECTED':
      return { icon: <IconX size={18} stroke={2} />, bg: '#fef2f2', color: '#ef4444' }; // Red
    case 'EXCHANGE_REQUEST_RECEIVED':
    case 'CHAT_REQUEST_RECEIVED':
    case 'SESSION_PROPOSED':
    case 'SESSION_COMPLETION_PENDING':
      return { icon: <IconCalendarEvent size={18} stroke={2} />, bg: '#fffbeb', color: '#f59e0b' }; // Amber/Yellow
    default:
      return { icon: <IconBell size={18} stroke={2} />, bg: '#f3f4f6', color: '#4b5563' }; // Grey
  }
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hr ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " min ago";
  return Math.floor(seconds) + " sec ago";
};

const NotificationPanel = ({ notifications, onClose, onMarkAllRead, onNotificationClick, onDeleteNotification, onDeleteMultipleNotifications }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const unreadCount = notifications.filter(n => n.isRead === false || n.read === false || n.unread === true).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (e.target.checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} notifications?`)) {
      if (onDeleteMultipleNotifications) {
        onDeleteMultipleNotifications(Array.from(selectedIds));
      } else if (onDeleteNotification) {
        Array.from(selectedIds).forEach(id => onDeleteNotification(id));
      }
      setSelectedIds(new Set());
    }
  };

  const isSelectionMode = selectedIds.size > 0;

  return (
    <div className="notif-panel-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-header">
          {isSelectionMode ? (
            <div className="notif-selection-header" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === notifications.length && notifications.length > 0}
                  ref={input => {
                    if (input) {
                      input.indeterminate = selectedIds.size > 0 && selectedIds.size < notifications.length;
                    }
                  }}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                  {selectedIds.size} selected
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={handleBulkDelete}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  <IconTrash size={14} />
                  Delete Selected
                </button>
                <button className="notif-close-btn" onClick={() => setSelectedIds(new Set())}>
                  <IconX size={20} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="notif-header-text">
                <h3>Notification History</h3>
                <span className="notif-unread-count">{unreadCount} unread</span>
              </div>
              <button className="notif-close-btn" onClick={onClose}>
                <IconX size={20} />
              </button>
            </>
          )}
        </div>

        {/* Body */}
        <div className="notif-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <IconCheck size={32} />
              </div>
              <h4>You're all caught up</h4>
              <p>No notifications right now.</p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((notif) => {
                const { icon, bg, color } = getIconForType(notif.type);
                const isUnread = notif.isRead === false || notif.read === false || notif.unread === true;
                const isSelected = selectedIds.has(notif.id);
                return (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${isUnread ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelectionMode) {
                        handleSelectItem({ target: { checked: !isSelected }, stopPropagation: () => {} }, notif.id);
                      } else if (onNotificationClick) {
                        onNotificationClick(notif);
                      }
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: isSelected ? '#f8fafc' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(e, notif.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                    <div className="notif-icon-wrapper" style={{ backgroundColor: bg, color: color, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div className="notif-content" style={{ flex: 1 }}>
                      <div className="notif-title-row">
                        <div className="notif-title">{notif.title}</div>
                        {isUnread && <div className="notif-unread-dot"></div>}
                      </div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-meta">
                        <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                    {onDeleteNotification && !isSelectionMode && (
                      <button 
                        className="notif-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notif.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          marginLeft: '8px'
                        }}
                        title="Delete notification"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSelectionMode && unreadCount > 0 && (
          <div className="notif-footer" onClick={onMarkAllRead}>
            Mark all as read
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
