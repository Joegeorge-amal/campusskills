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
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY) || localStorage.getItem('cs_token');
      if (token) {
        socketService.connect(token, handleMessage, handleStatusChange);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
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
