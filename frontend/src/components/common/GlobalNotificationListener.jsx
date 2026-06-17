import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import GlobalNotificationPopup from './GlobalNotificationPopup';
import { useNavigate } from 'react-router-dom';

const GlobalNotificationListener = () => {
  const { lastMessage } = useWebSocket();
  const [activeNotification, setActiveNotification] = useState(null);
  // Add a key to force re-render/reset animations when a new notification arrives quickly
  const [notificationKey, setNotificationKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NOTIFICATION') {
      const payload = lastMessage.payload;
      
      const isPanelOpen = document.querySelector('.admin-notif-dropdown') !== null;
      if (isPanelOpen) {
        // Notification panel is open, update panel but do not show popup
        return;
      }

      const currentPath = window.location.pathname;

      if (payload.type === 'NEW_MESSAGE' && payload.sourceType === 'CHAT') {
        const chatPath = `/app/messages/${payload.sourceId}`;
        if (currentPath === chatPath || currentPath === `${chatPath}/`) {
          // User is currently looking at this specific chat
          return;
        }
      }

      if (payload.sourceType === 'SESSION') {
        if (currentPath.startsWith('/app/sessions')) {
          // User is currently looking at sessions
          return;
        }
      }

      if (payload.sourceType === 'EXCHANGE' || payload.sourceType === 'CHAT_REQUEST' || (payload.type && payload.type.includes('REQUEST'))) {
        if (currentPath.startsWith('/app/requests')) {
          // User is currently looking at requests
          return;
        }
      }

      setActiveNotification(payload);
      setNotificationKey(prev => prev + 1);
    }
  }, [lastMessage]);

  const handleNotificationClick = () => {
    if (!activeNotification) return;
    
    // Mark as read immediately and hide popup
    window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
      detail: { sourceType: activeNotification.sourceType, sourceId: activeNotification.sourceId } 
    }));
    
    const notif = activeNotification;
    setActiveNotification(null);

    if (notif.sourceType === 'SESSION') {
      navigate('/app/sessions', { state: { highlightSessionId: notif.sourceId } });
    } else if (notif.sourceType === 'CHAT') {
      navigate(`/app/messages/${notif.sourceId}`);
    } else if (notif.sourceType === 'EXCHANGE' || notif.sourceType === 'CHAT_REQUEST' || (notif.type && notif.type.includes('REQUEST'))) {
      navigate('/app/requests', { state: { highlightRequestId: notif.sourceId } });
    }
  };

  if (!activeNotification) return null;

  return (
    <GlobalNotificationPopup
      key={`global-notif-${notificationKey}`}
      title={activeNotification.title}
      subtitle={activeNotification.message}
      badge="NOTIFICATION"
      badgeColor="#1d4ed8"
      autoCloseMs={5000}
      onClose={() => setActiveNotification(null)}
      onClick={handleNotificationClick}
    />
  );
};

export default GlobalNotificationListener;
