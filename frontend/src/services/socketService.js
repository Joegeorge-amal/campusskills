// Isolated WebSocket connection utility supporting Vert.x endpoints
let wsConnection = null;
let connectionGen = 0;
let reconnectInterval = 1000;
const maxReconnectInterval = 30000;
let reconnectTimer = null;
let isExpectedClose = false;

// Environment-based WebSocket URL (VITE_WS_URL overrides auto-detection)
const WS_BASE_URL = import.meta.env.VITE_WS_URL
  || (import.meta.env.MODE === 'production'
    ? 'wss://campusskills.onrender.com/ws'
    : 'ws://localhost:8080/ws');

export const socketService = {
  connect: (tokenOrGetter, onMessage, onStatusChange) => {
    if (wsConnection) {
      console.warn('[WS-Service] Connection already active. Disconnect first.');
      return;
    }

    reconnectInterval = 1000;
    isExpectedClose = false;
    onStatusChange('connecting');

    const token = typeof tokenOrGetter === 'function' ? tokenOrGetter() : tokenOrGetter;
    if (!token) {
      console.warn('[WS-Service] No token provided, aborting connection.');
      onStatusChange('disconnected');
      return;
    }

    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;

    console.log('[WS-Service] Connecting...', { url: wsUrl.replace(/token=.*/, 'token=***') });
    try {
      const currentGen = ++connectionGen;
      const conn = new WebSocket(wsUrl);
      wsConnection = conn;

      conn.onopen = () => {
        if (connectionGen !== currentGen) return;
        console.log('[WS-Service] socket connected');
        reconnectInterval = 1000; // Reset reconnect interval
        onStatusChange('connected');
      };

      conn.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          onMessage(parsedData);
        } catch (e) {
          console.error('[WS-Service] Error parsing incoming websocket message payload:', e);
          onMessage({ type: 'RAW_TEXT', data: event.data });
        }
      };

      conn.onclose = (event) => {
        if (connectionGen !== currentGen) {
          console.log('[WS-Service] socket disconnected (stale)');
          return;
        }
        wsConnection = null;
        console.log('[WS-Service] socket disconnected');
        onStatusChange('disconnected');

        if (!isExpectedClose) {
          console.warn(`[WS-Service] Attempting reconnect in ${reconnectInterval}ms...`);
          reconnectTimer = setTimeout(() => {
            reconnectInterval = Math.min(reconnectInterval * 2, maxReconnectInterval);
            socketService.connect(tokenOrGetter, onMessage, onStatusChange);
          }, reconnectInterval);
        } else {
          console.log('[WS-Service] socket disconnected (expected)');
        }
      };

      wsConnection.onerror = (error) => {
        console.error('[WS-Service] Socket error detected:', error);
      };

    } catch (err) {
      console.error('[WS-Service] Socket creation crashed:', err);
      onStatusChange('disconnected');
    }
  },

  send: (eventType, payload) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      console.warn('[WS-Service] Cannot emit:', eventType, '(socket offline)');
      return false;
    }

    try {
      const messageBody = JSON.stringify({ type: eventType, payload });
      wsConnection.send(messageBody);
      return true;
    } catch (e) {
      console.error('[WS-Service] Failed to serialize and send message payload:', e);
      return false;
    }
  },

  disconnect: () => {
    isExpectedClose = true;
    ++connectionGen; // Invalidate all future stale callbacks
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (wsConnection) {
      console.log('[WS-Service] socket reused');
      wsConnection.close();
      wsConnection = null;
    }
  }
};
