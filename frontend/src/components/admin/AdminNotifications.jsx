import React, { useState, useRef, useEffect } from 'react';
import { IconBell, IconUsers, IconCalendarEvent, IconCurrencyRupee, IconAlertTriangle, IconCircleCheck, IconLoader } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import { APP_CONFIG } from '../../config';
import { useWebSocket } from '../../context/WebSocketContext';
import '../../styles/admin.css';

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { lastMessage } = useWebSocket();

  const fetchNotifications = async () => {
    try {
      if (!notifications.length) setLoading(true);
      const res = await adminService.getNotifications({ limit: 50 });
      setNotifications(res?.notifications || []);
      setUnreadCount(res?.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setError('Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NOTIFICATION') {
      const newNotif = lastMessage.payload;
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage]);

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

  const markAllRead = async () => {
    try {
      await adminService.markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await adminService.markNotificationsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ADMIN_NEW_STUDENT': return <IconUsers size={16} color="#3b82f6" />;
      case 'ADMIN_SESSION_BOOKED': return <IconCalendarEvent size={16} color="#10b981" />;
      case 'ADMIN_PAYMENT_RECEIVED': return <IconCurrencyRupee size={16} color="#8b5cf6" />;
      case 'ADMIN_DISPUTE_RAISED': return <IconAlertTriangle size={16} color="#f59e0b" />;
      case 'ADMIN_DISPUTE_RESOLVED': return <IconCircleCheck size={16} color="#10b981" />;
      default: return <IconBell size={16} color="#6b7280" />;
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
            {loading && notifications.length === 0 ? (
              <div className="admin-notif-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <IconLoader className="spin" size={24} color="#6b7280" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="admin-notif-empty" style={{ color: '#ef4444' }}>{error}</div>
            ) : notifications.length === 0 ? (
              <div className="admin-notif-empty">No notifications</div>
            ) : (
              (showAll ? notifications : notifications.slice(0, 3)).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`admin-notif-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id, notif.isRead)}
                  style={{ cursor: !notif.isRead ? 'pointer' : 'default' }}
                >
                  <div className="admin-notif-icon-wrapper">
                    {getIcon(notif.type)}
                  </div>
                  <div className="admin-notif-content">
                    <div className="admin-notif-title">{notif.title}</div>
                    <div className="admin-notif-msg">{notif.message}</div>
                    <div className="admin-notif-time">{formatTimeAgo(notif.createdAt)}</div>
                  </div>
                  {!notif.isRead && <div className="admin-notif-dot"></div>}
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
