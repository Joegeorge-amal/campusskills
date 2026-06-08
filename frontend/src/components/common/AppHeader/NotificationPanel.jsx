import React from 'react';
import { IconCheck, IconCurrencyRupee, IconX, IconCalendarEvent, IconFlag } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import './NotificationPanel.css';

const getIconForType = (type) => {
  switch (type) {
    case 'accepted':
    case 'swap_accepted':
      return { icon: <IconCheck size={18} stroke={2.5} />, bg: '#ecfdf5', color: '#10b981' }; // Green
    case 'payment':
      return { icon: <IconCurrencyRupee size={18} stroke={2.5} />, bg: '#f1f5f9', color: '#1d4ed8' }; // Light grey with blue icon
    case 'declined':
      return { icon: <IconX size={18} stroke={2.5} />, bg: '#fef2f2', color: '#ef4444' }; // Red
    case 'booked':
      return { icon: <IconCalendarEvent size={18} stroke={2.5} />, bg: '#eff6ff', color: '#1d4ed8' }; // Light blue with blue icon
    case 'report':
      return { icon: <IconFlag size={18} stroke={2.5} />, bg: '#fef9c3', color: '#eab308' }; // Yellow
    default:
      return { icon: <IconCheck size={18} stroke={2.5} />, bg: '#f3f4f6', color: '#374151' }; // Grey
  }
};

const NotificationPanel = ({ notifications, onClose, onMarkAllRead }) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleActionClick = (url) => {
    if (url) {
      navigate(url);
      onClose();
    }
  };

  return (
    <div className="notif-panel-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-text">
            <h3>Notifications</h3>
            <span className="notif-unread-count">{unreadCount} unread</span>
          </div>
          <button className="notif-close-btn" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="notif-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <IconCheck size={32} />
              </div>
              <h4>You're all caught up</h4>
              <p>No new notifications right now.</p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((notif) => {
                const { icon, bg, color } = getIconForType(notif.type);
                return (
                  <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                    <div className="notif-icon-wrapper" style={{ backgroundColor: bg, color: color }}>
                      {icon}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <div className="notif-title">{notif.title}</div>
                        {notif.unread && <div className="notif-unread-dot"></div>}
                      </div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-meta">
                        <span className="notif-time">{notif.timestamp}</span>
                        {notif.actionUrl && notif.actionLabel && (
                          <button 
                            className="notif-action-btn"
                            onClick={() => handleActionClick(notif.actionUrl)}
                          >
                            {notif.actionLabel} &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notif-footer" onClick={onMarkAllRead}>
            Mark all as read
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
