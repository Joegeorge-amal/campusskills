package com.campusskills.web.websockets;

import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.JsonObject;
import java.util.concurrent.ConcurrentHashMap;

public class ConnectionManager {
    
    public static class UserConnection {
        public final String userId;
        public final String role;
        public final ServerWebSocket socket;
        
        public UserConnection(String userId, String role, ServerWebSocket socket) {
            this.userId = userId;
            this.role = role;
            this.socket = socket;
        }
    }

    // Maps userId -> UserConnection
    private static final ConcurrentHashMap<String, UserConnection> connections = new ConcurrentHashMap<>();

    public static void addConnection(String userId, String role, ServerWebSocket ws) {
        connections.put(userId, new UserConnection(userId, role, ws));
    }

    public static void removeConnection(String userId) {
        if (userId != null) {
            connections.remove(userId);
        }
    }

    public static void sendMessage(String userId, JsonObject payload) {
        if (userId != null) {
            UserConnection conn = connections.get(userId);
            if (conn != null && !conn.socket.isClosed()) {
                conn.socket.writeTextMessage(payload.encode());
            }
        }
    }

    public static void broadcastToUser(String userId, JsonObject payload) {
        sendMessage(userId, payload);
    }

    public static void broadcastToAdmins(JsonObject payload) {
        for (UserConnection conn : connections.values()) {
            if ("ADMIN".equals(conn.role) && !conn.socket.isClosed()) {
                conn.socket.writeTextMessage(payload.encode());
            }
        }
    }
}
