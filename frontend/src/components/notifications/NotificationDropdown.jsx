import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconMessage, IconCalendarEvent, IconAlertCircle, IconCheck, IconLoader } from '@tabler/icons-react';
import notificationService from '../../services/notificationService';
import { useWebSocket } from '../../context/WebSocketContext';
import NotificationPanel from '../common/AppHeader/NotificationPanel';
import '../../styles/admin.css';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { lastMessage } = useWebSocket();

  const fetchNotifications = async () => {
    try {
      if (!notifications.length) setLoading(true);
      const res = await notificationService.getNotifications({ limit: 50 });
      const rawNotifications = res?.notifications || [];
      const sortedNotifications = [...rawNotifications].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(sortedNotifications);
      
      const unreadRes = await notificationService.getUnreadNotifications({ limit: 50 });
      const rawUnread = unreadRes?.notifications || [];
      setUnreadCount(rawUnread.length);
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
      
      setNotifications(prev => {
        const exists = prev.some(n => n.id === newNotif.id);
        let updatedList;
        if (exists) {
          updatedList = prev.map(n => n.id === newNotif.id ? newNotif : n);
        } else {
          updatedList = [newNotif, ...prev];
          const isUnread = newNotif.isRead === false || newNotif.read === false || newNotif.unread === true;
          if (isUnread) {
            setUnreadCount(c => c + 1);
          }
        }
        return updatedList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      });
    }
  }, [lastMessage]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true, read: true, unread: false })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const markAsRead = async (id, isReadVal) => {
    const isAlreadyRead = isReadVal === true || isReadVal === 'true';
    if (isAlreadyRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true, read: true, unread: false } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    await markAsRead(notif.id, notif.isRead);
    setIsOpen(false);

    if (notif.sourceType === 'SESSION') {
      navigate('/app/sessions', { state: { highlightSessionId: notif.sourceId } });
    } else if (notif.sourceType === 'CHAT') {
      navigate(`/app/messages/${notif.sourceId}`);
    } else if (notif.sourceType === 'EXCHANGE' || notif.sourceType === 'CHAT_REQUEST' || (notif.type && notif.type.includes('REQUEST'))) {
      navigate('/app/requests', { state: { highlightRequestId: notif.sourceId } });
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'NEW_MESSAGE': return <IconMessage size={16} color="#3b82f6" />;
      case 'SESSION_REMINDER': return <IconCalendarEvent size={16} color="#f59e0b" />;
      case 'SESSION_COMPLETED': return <IconCheck size={16} color="#10b981" />;
      case 'ACCOUNT_ALERT': return <IconAlertCircle size={16} color="#ef4444" />;
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
    <div className="admin-nav-notifications" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="header-icon-box" 
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={isOpen}
        style={{
          border: '1px solid #dbeafe',
          background: '#ffffff',
          color: '#475569',
          padding: 0,
          margin: 0
        }}
      >
        <IconBell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="admin-notif-overlay fade-in" onClick={() => setIsOpen(false)}></div>
          <div className="admin-notif-dropdown fade-in" style={{right: 0, left: 'auto', top: '50px'}}>
            <div className="admin-notif-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#111827' }}>Unread Inbox</h3>
                {unreadCount > 0 && (
                  <span className="admin-notif-count-badge">{unreadCount} new</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button className="admin-notif-mark-read" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="admin-notif-list">
              {loading && notifications.length === 0 ? (
                <div className="admin-notif-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <IconLoader className="spin" size={24} color="#6b7280" />
                  <span>Loading notifications...</span>
                </div>
              ) : error ? (
                <div className="admin-notif-empty" style={{ color: '#ef4444' }}>{error}</div>
              ) : notifications.filter(n => n.isRead === false || n.read === false || n.unread === true).length === 0 ? (
                <div className="admin-notif-empty">No unread notifications</div>
              ) : (
                notifications
                  .filter(n => n.isRead === false || n.read === false || n.unread === true)
                  .map((notif) => {
                    const isUnread = notif.isRead === false || notif.read === false || notif.unread === true;
                    return (
                      <div 
                        key={notif.id} 
                        className={`admin-notif-item ${isUnread ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="admin-notif-icon-wrapper">
                          {getIcon(notif.type)}
                        </div>
                        <div className="admin-notif-content">
                          <div className="admin-notif-title">{notif.title}</div>
                          <div className="admin-notif-msg">{notif.message}</div>
                          <div className="admin-notif-time">{formatTimeAgo(notif.createdAt)}</div>
                        </div>
                        {isUnread && <div className="admin-notif-dot"></div>}
                      </div>
                    );
                  })
              )}
            </div>
            
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsSidePanelOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '4px 0'
                }}
              >
                Show All Notifications
              </button>
            </div>
          </div>
        </>
      )}

      {isSidePanelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setIsSidePanelOpen(false)}
          onMarkAllRead={markAllRead}
          onNotificationClick={(notif) => {
            handleNotificationClick(notif);
            setIsSidePanelOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
