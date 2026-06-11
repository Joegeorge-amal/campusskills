import React, { useState, useRef, useEffect } from 'react';
import { IconBell, IconUsers, IconCalendarEvent, IconCurrencyRupee, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { mockNotifications } from '../../data/adminDashboardData';
import '../../styles/admin.css';

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) setShowAll(false); // reset when closing
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <IconUsers size={16} color="#3b82f6" />;
      case 'session': return <IconCalendarEvent size={16} color="#10b981" />;
      case 'payment': return <IconCurrencyRupee size={16} color="#8b5cf6" />;
      case 'dispute': return <IconAlertTriangle size={16} color="#f59e0b" />;
      case 'success': return <IconCircleCheck size={16} color="#10b981" />;
      default: return <IconBell size={16} color="#6b7280" />;
    }
  };

  return (
    <div className="admin-nav-notifications" ref={dropdownRef}>
      <button 
        className="admin-bell-btn" 
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <IconBell size={20} />
        {unreadCount > 0 && (
          <span className="admin-bell-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="admin-notif-dropdown fade-in">
          <div className="admin-notif-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#111827' }}>Notifications</h3>
              {unreadCount > 0 && (
                <span className="admin-notif-count-badge">{unreadCount} unread</span>
              )}
            </div>
            <button className="admin-notif-mark-read" onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          
          <div className="admin-notif-list">
            {notifications.length === 0 ? (
              <div className="admin-notif-empty">No notifications</div>
            ) : (
              (showAll ? notifications : notifications.slice(0, 3)).map((notif) => (
                <div key={notif.id} className={`admin-notif-item ${notif.unread ? 'unread' : ''}`}>
                  <div className="admin-notif-icon-wrapper">
                    {getIcon(notif.type)}
                  </div>
                  <div className="admin-notif-content">
                    <div className="admin-notif-title">{notif.title}</div>
                    <div className="admin-notif-msg">{notif.message}</div>
                    <div className="admin-notif-time">{notif.time}</div>
                  </div>
                  {notif.unread && <div className="admin-notif-dot"></div>}
                </div>
              ))
            )}
          </div>
          {!showAll && notifications.length > 3 && (
            <div className="admin-notif-footer">
              <button className="admin-notif-view-all" onClick={() => setShowAll(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: '12px', fontSize: '13px' }}>
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
