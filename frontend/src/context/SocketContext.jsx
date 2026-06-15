import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    socketService.connect(
      token,
      (message) => {
        setLastMessage(message);
      },
      (status) => {
        setSocketStatus(status);
      }
    );
  }, []);

  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, connectSocket, disconnectSocket]);

  const sendSocketEvent = (eventType, payload) => {
    return socketService.send(eventType, payload);
  };

  return (
    <SocketContext.Provider
      value={{
        socketStatus,
        lastMessage,
        sendSocketEvent,
        connectSocket
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

