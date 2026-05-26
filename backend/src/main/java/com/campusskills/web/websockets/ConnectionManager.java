package com.campusskills.web.websockets;

import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.JsonObject;
import java.util.concurrent.ConcurrentHashMap;

public class ConnectionManager {
    
    // Maps userId -> WebSocket
    private static final ConcurrentHashMap<String, ServerWebSocket> connections = new ConcurrentHashMap<>();

    public static void addConnection(String userId, ServerWebSocket ws) {
        connections.put(userId, ws);
    }

    public static void removeConnection(String userId) {
        if (userId != null) {
            connections.remove(userId);
        }
    }

    public static void sendMessage(String userId, JsonObject payload) {
        if (userId != null) {
            ServerWebSocket ws = connections.get(userId);
            if (ws != null && !ws.isClosed()) {
                ws.writeTextMessage(payload.encode());
            }
        }
    }
}
