import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';
import { APP_CONFIG } from '../config';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((msg) => {
    setLastMessage(msg);
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    console.log('[WebSocket] status:', newStatus);
    setStatus(newStatus);
    if (newStatus === 'disconnected') {
      // Trigger a silent API call to force Axios interceptor to refresh token if expired
      import('../services/userService').then(({ userService }) => {
        userService.getMe().catch(() => {
          // Ignore errors, this is just to trigger the token refresh
        });
      });
    }
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      if (isAuthenticated) {
        console.log('[WebSocketContext] Token refreshed, reconnecting WebSocket immediately...');
        const getNewToken = () => e.detail || localStorage.getItem(APP_CONFIG.TOKEN_KEY) || localStorage.getItem('cs_token');
        socketService.disconnect();
        socketService.connect(getNewToken, handleMessage, handleStatusChange);
      }
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);

    if (isAuthenticated) {
      const getToken = () => localStorage.getItem(APP_CONFIG.TOKEN_KEY) || localStorage.getItem('cs_token');
      socketService.connect(getToken, handleMessage, handleStatusChange);
    } else {
      socketService.disconnect();
    }

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      socketService.disconnect();
    };
  }, [isAuthenticated, handleMessage, handleStatusChange]);

  const sendMessage = useCallback((type, payload) => {
    socketService.send(type, payload);
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
