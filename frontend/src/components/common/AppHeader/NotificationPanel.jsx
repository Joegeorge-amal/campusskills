import React, { useState } from 'react';
import { IconCheck, IconX, IconCalendarEvent, IconBell, IconMessage, IconTrash, IconListCheck } from '@tabler/icons-react';
import './NotificationPanel.css';
import LoadingSpinner from '../../common/LoadingSpinner';

import ConfirmModal from '../../modals/ConfirmModal';

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

const NotificationPanel = ({ notifications, loading, onClose, onMarkAllRead, onNotificationClick, onDeleteNotification, onDeleteMultipleNotifications }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  
  const unreadCount = notifications.filter(n => n.isRead === false || n.read === false || n.unread === true).length;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const toggleSelectionMode = () => {
    setIsSelectionModeActive(!isSelectionModeActive);
    if (isSelectionModeActive) {
      setSelectedIds(new Set()); // Clear selection when exiting
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length && notifications.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setIsConfirmOpen(true);
  };

  const executeBulkDelete = () => {
    if (onDeleteMultipleNotifications) {
      onDeleteMultipleNotifications(Array.from(selectedIds));
    } else if (onDeleteNotification) {
      Array.from(selectedIds).forEach(id => onDeleteNotification(id));
    }
    setSelectedIds(new Set());
    setIsSelectionModeActive(false);
    setIsConfirmOpen(false);
  };

  return (
    <div className="notif-panel-overlay" onClick={onClose}>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeBulkDelete}
        title="Delete Notifications"
        message={`Are you sure you want to delete ${selectedIds.size} notifications?`}
        confirmText="Delete"
        isDanger={true}
      />
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-header" style={{ transition: 'background 0.3s' }}>
          {isSelectionModeActive ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>Selection Mode</h3>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>{selectedIds.size} selected</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleSelectAll}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff', cursor: 'pointer',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500
                  }}
                >
                  {selectedIds.size === notifications.length && notifications.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <button 
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  style={{
                    background: selectedIds.size > 0 ? '#ef4444' : 'rgba(255, 255, 255, 0.1)', 
                    border: 'none', color: selectedIds.size > 0 ? '#fff' : 'rgba(255, 255, 255, 0.4)', 
                    cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                    padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                    borderRadius: '6px', fontSize: '13px', fontWeight: 500, transition: 'background 0.2s'
                  }}
                >
                  <IconTrash size={14} /> Delete Selected
                </button>
                <button 
                  onClick={toggleSelectionMode}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', 
                    cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', 
                    fontWeight: 500, marginLeft: 'auto'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="notif-header-text">
                <h3>Notification History</h3>
                <span className="notif-unread-count">{unreadCount} unread</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notifications.length > 0 && (onDeleteMultipleNotifications || onDeleteNotification) && (
                  <button 
                    onClick={toggleSelectionMode}
                    style={{
                      background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', 
                      cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', 
                      fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <IconListCheck size={16} /> Select
                  </button>
                )}
                <button className="notif-close-btn" onClick={onClose}>
                  <IconX size={20} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="notif-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0', height: '100%' }}>
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <IconCheck size={32} />
              </div>
               <h4>You're all caught up 🎉</h4>
              <p>New messages, requests and session updates will appear here.</p>
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
                    className={`notif-item ${isUnread ? 'unread' : ''} ${isSelected && isSelectionModeActive ? 'selected' : ''}`}
                    onClick={(e) => {
                      if (isSelectionModeActive) {
                        handleSelectItem(e, notif.id);
                      } else if (onNotificationClick) {
                        onNotificationClick(notif);
                      }
                    }}
                    style={{ 
                      cursor: 'pointer', 
                    }}
                  >
                    <div className={`notif-checkbox-container ${isSelectionModeActive ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
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
                    {onDeleteNotification && !isSelectionModeActive && (
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
        {!isSelectionModeActive && unreadCount > 0 && (
          <div className="notif-footer" onClick={onMarkAllRead}>
            Mark all as read
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
