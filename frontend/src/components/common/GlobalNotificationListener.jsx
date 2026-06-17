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
      
      // If the notification is for a new chat message, check if we're already in that chat
      if (payload.type === 'NEW_MESSAGE' && payload.sourceType === 'CHAT') {
        const currentPath = window.location.pathname;
        const chatPath = `/app/messages/${payload.sourceId}`;
        if (currentPath === chatPath || currentPath === `${chatPath}/`) {
          // Do not show popup if already in the chat
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
