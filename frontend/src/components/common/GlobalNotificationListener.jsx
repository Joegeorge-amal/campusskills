import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import GlobalNotificationPopup from './GlobalNotificationPopup';

const GlobalNotificationListener = () => {
  const { lastMessage } = useWebSocket();
  const [activeNotification, setActiveNotification] = useState(null);
  // Add a key to force re-render/reset animations when a new notification arrives quickly
  const [notificationKey, setNotificationKey] = useState(0);

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
    />
  );
};

export default GlobalNotificationListener;
