import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [logs, setLogs] = useState([]);
  const socketRef = useRef(null);
  const reconnectCountRef = useRef(0);

  const addLog = (logText) => {
    setLogs((prev) => [`[WS] ${new Date().toLocaleTimeString()} - ${logText}`, ...prev].slice(0, 50));
  };

  const connectSocket = () => {
    const token = localStorage.getItem('cs_token') || 'placeholder-jwt-token';
    const wsUrl = `ws://localhost:8080/chat?token=${token}`;

    addLog(`Initiating WebSocket connection to ${wsUrl}...`);
    setSocketStatus('connecting');

    // Simulate standard browser WebSocket
    setTimeout(() => {
      setSocketStatus('connected');
      reconnectCountRef.current = 0;
      addLog('WebSocket connection established successfully! Handshake complete.');
    }, 1000);
  };

  const disconnectSocket = () => {
    addLog('Closing WebSocket connection...');
    setSocketStatus('disconnected');
  };

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated]);

  // Simulate network disconnect and reconnect retry loops
  const simulateNetworkFailure = () => {
    if (socketStatus !== 'connected') return;

    addLog('Warning: Lost connection to WebSocket server. Triggering reconnect loop...');
    setSocketStatus('disconnected');

    const attemptReconnect = () => {
      if (reconnectCountRef.current >= 5) {
        addLog('Error: Max reconnection attempts reached. Please verify backend state.');
        setSocketStatus('failed');
        return;
      }

      reconnectCountRef.current += 1;
      setSocketStatus('reconnecting');
      addLog(`Attempting to reconnect (${reconnectCountRef.current}/5) in 3 seconds...`);

      setTimeout(() => {
        setSocketStatus('connected');
        reconnectCountRef.current = 0;
        addLog('Reconnected to Vert.x WebSocket server successfully.');
      }, 3000);
    };

    attemptReconnect();
  };

  const sendSocketEvent = (eventType, payload) => {
    if (socketStatus !== 'connected') {
      addLog(`Failed to send event [${eventType}]. Socket is offline.`);
      return false;
    }

    addLog(`Sent payload [${eventType}]: ${JSON.stringify(payload)}`);
    return true;
  };

  return (
    <SocketContext.Provider
      value={{
        socketStatus,
        logs,
        sendSocketEvent,
        simulateNetworkFailure,
        connectSocket
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
