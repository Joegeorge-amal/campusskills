package com.campusskills.web.websockets;

import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.JsonObject;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConnectionManager {
    
    private static final Logger log = LoggerFactory.getLogger(ConnectionManager.class);

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
        // Atomically replace and close any previous connection for this user.
        // Prevents multiple sockets per user and ensures stale sockets are cleaned up.
        UserConnection old = connections.put(userId, new UserConnection(userId, role, ws));
        if (old != null) {
            log.info("[CM] user connected [userId={}] reconnected=true oldSocketClosed={}", userId, old.socket.isClosed());
        } else {
            log.info("[CM] user connected [userId={}]", userId);
        }
        if (old != null && !old.socket.isClosed()) {
            try {
                old.socket.close();
            } catch (Exception e) {
                log.warn("[CM] Failed to close old socket for user {}: {}", userId, e.getMessage());
            }
        }
    }

    public static void removeConnection(String userId) {
        if (userId != null) {
            connections.remove(userId);
        }
    }

    public static UserConnection getConnection(String userId) {
        if (userId == null) return null;
        return connections.get(userId);
    }

    public static boolean isUserOnline(String userId) {
        if (userId == null) return false;
        UserConnection conn = connections.get(userId);
        return conn != null && !conn.socket.isClosed();
    }

    public static java.util.Set<String> getOnlineUserIds() {
        return connections.keySet();
    }

    public static void sendMessage(String userId, JsonObject payload) {
        if (userId != null) {
            UserConnection conn = connections.get(userId);
            if (conn != null && !conn.socket.isClosed()) {
                try {
                    conn.socket.writeTextMessage(payload.encode());
                } catch (Exception e) {
                    log.warn("[CM] Failed to send message to user {}: {}", userId, e.getMessage());
                }
            } else if (conn == null) {
                log.debug("[CM] recipient socket not found [userId={}]", userId);
            } else {
                log.debug("[CM] recipient socket closed [userId={}]", userId);
            }
        }
    }

    public static void broadcastToUser(String userId, JsonObject payload) {
        sendMessage(userId, payload);
    }

    public static void broadcastToAdmins(JsonObject payload) {
        String encoded = payload.encode();
        for (UserConnection conn : connections.values()) {
            if ("ADMIN".equals(conn.role) && !conn.socket.isClosed()) {
                try {
                    conn.socket.writeTextMessage(encoded);
                } catch (Exception e) {
                    log.warn("[CM] Failed to broadcast to admin {}: {}", conn.userId, e.getMessage());
                }
            }
        }
    }

    public static void broadcastToAll(JsonObject payload) {
        String encoded = payload.encode();
        for (UserConnection conn : connections.values()) {
            if (!conn.socket.isClosed()) {
                try {
                    conn.socket.writeTextMessage(encoded);
                } catch (Exception e) {
                    log.warn("[CM] Failed to broadcast to user {}: {}", conn.userId, e.getMessage());
                }
            }
        }
    }
}
