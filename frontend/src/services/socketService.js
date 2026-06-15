// Isolated WebSocket connection utility supporting Vert.x endpoints
let wsConnection = null;
let reconnectInterval = 1000;
let maxReconnectInterval = 30000;
let reconnectTimer = null;
let isExpectedClose = false;

export const socketService = {
  connect: (tokenOrGetter, onMessage, onStatusChange) => {
    if (wsConnection) {
      console.warn('[WS-Service] Connection already active. Disconnect first.');
      return;
    }

    isExpectedClose = false;
    onStatusChange('connecting');

    const token = typeof tokenOrGetter === 'function' ? tokenOrGetter() : tokenOrGetter;
    if (!token) {
      console.warn('[WS-Service] No token provided, aborting connection.');
      onStatusChange('disconnected');
      return;
    }

    const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;

    try {
      wsConnection = new WebSocket(wsUrl);

      wsConnection.onopen = () => {
        console.log('[WS-Service] WebSocket connection active.');
        reconnectInterval = 1000; // Reset reconnect interval
        onStatusChange('connected');
      };

      wsConnection.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          onMessage(parsedData);
        } catch (e) {
          console.error('[WS-Service] Error parsing incoming websocket message payload:', e);
          onMessage({ type: 'RAW_TEXT', data: event.data });
        }
      };

      wsConnection.onclose = (event) => {
        wsConnection = null;
        onStatusChange('disconnected');

        if (!isExpectedClose) {
          console.warn(`[WS-Service] Closed unexpectedly. Attempting reconnect in ${reconnectInterval}ms...`);
          reconnectTimer = setTimeout(() => {
            // Exponential backoff reconnect
            reconnectInterval = Math.min(reconnectInterval * 2, maxReconnectInterval);
            socketService.connect(tokenOrGetter, onMessage, onStatusChange);
          }, reconnectInterval);
        } else {
          console.log('[WS-Service] Disconnected cleanly.');
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
      console.warn('[WS-Service] Cannot emit message. Socket state is offline.');
      return false;
    }

    try {
      const messageBody = JSON.stringify({ event: eventType, data: payload });
      wsConnection.send(messageBody);
      return true;
    } catch (e) {
      console.error('[WS-Service] Failed to serialize and send message payload:', e);
      return false;
    }
  },

  disconnect: () => {
    isExpectedClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
  }
};
