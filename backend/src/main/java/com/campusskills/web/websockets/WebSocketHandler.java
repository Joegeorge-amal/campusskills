package com.campusskills.web.websockets;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.ServerWebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import com.campusskills.shared.constants.WebSocketEventType;
import com.campusskills.web.websockets.ConnectionManager.UserConnection;

public class WebSocketHandler implements Handler<ServerWebSocket> {
    
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);
    private final Vertx vertx;
    private final JWTAuth jwtAuth;
    
    private WebSocketHandler(Vertx vertx, JWTAuth jwtAuth) {
        this.vertx = vertx;
        this.jwtAuth = jwtAuth;
    }

    public static WebSocketHandler create(Vertx vertx, JWTAuth jwtAuth) {
        return new WebSocketHandler(vertx, jwtAuth);
    }

    @Override
    public void handle(ServerWebSocket ws) {
        if (!ws.path().startsWith("/ws")) {
            ws.reject();
            return;
        }

        String token = ws.query() != null ? getQueryParam(ws.query(), "token") : null;
        if (token == null || token.isEmpty()) {
            ws.reject(401);
            return;
        }

        jwtAuth.authenticate(new JsonObject().put("token", token))
            .onSuccess(user -> {
                String userId = user.principal().getString("userId");
                String role = user.principal().getString("role");
                if (userId == null) {
                    ws.reject(401);
                    return;
                }

                log.info("[WS] user connected [userId={}]", userId);
                ConnectionManager.addConnection(userId, role, ws);
                
                ConnectionManager.broadcastToAll(new JsonObject()
                    .put("type", WebSocketEventType.USER_ONLINE.name())
                    .put("payload", new JsonObject().put("userId", userId)));
                
                ws.handler(buffer -> {
                    try {
                        JsonObject data = buffer.toJsonObject();
                        String typeStr = data.getString("type");
                        JsonObject payload = data.getJsonObject("payload");
                        
                        if (typeStr != null && payload != null) {
                            WebSocketEventType type = WebSocketEventType.valueOf(typeStr);
                            
                            if (type == WebSocketEventType.TYPING_STARTED || type == WebSocketEventType.TYPING_STOPPED) {
                                String chatId = payload.getString("chatId");
                                if (chatId != null && !chatId.trim().isEmpty()) {
                                    // Strip any spoofed senderId and enforce authenticated identity
                                    payload.put("userId", userId);
                                    
                                    JsonObject event = new JsonObject()
                                        .put("type", typeStr)
                                        .put("payload", payload);
                                        
                                    vertx.eventBus().send("internal.typing.event", event);
                                }
                            } else if (type == WebSocketEventType.MESSAGE_DELIVERED) {
                                String messageId = payload.getString("messageId");
                                String chatId = payload.getString("chatId");
                                if (messageId != null && chatId != null) {
                                    payload.put("deliveredTo", userId);
                                    payload.put("deliveredAt", System.currentTimeMillis());
                                    JsonObject event = new JsonObject()
                                        .put("type", typeStr)
                                        .put("payload", payload);
                                    vertx.eventBus().send("internal.message.delivered", event);
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Invalid websocket message from {}: {}", userId, e.getMessage());
                    }
                });
                
                ws.closeHandler(v -> {
                    UserConnection activeConn = ConnectionManager.getConnection(userId);
                    if (activeConn != null && activeConn.socket == ws) {
                        log.info("[WS] socket disconnected [userId={}] reason=client", userId);
                        ConnectionManager.removeConnection(userId);
                        ConnectionManager.broadcastToAll(new JsonObject()
                            .put("type", WebSocketEventType.USER_OFFLINE.name())
                            .put("payload", new JsonObject().put("userId", userId)));
                    } else {
                        log.info("[WS] socket disconnected (stale) [userId={}]", userId);
                    }
                });
                
                ws.exceptionHandler(err -> {
                    UserConnection activeConn2 = ConnectionManager.getConnection(userId);
                    if (activeConn2 != null && activeConn2.socket == ws) {
                        log.info("[WS] socket disconnected [userId={}] reason=error: {}", userId, err.getMessage());
                        ConnectionManager.removeConnection(userId);
                        ConnectionManager.broadcastToAll(new JsonObject()
                            .put("type", WebSocketEventType.USER_OFFLINE.name())
                            .put("payload", new JsonObject().put("userId", userId)));
                    } else {
                        log.info("[WS] socket disconnected (stale) [userId={}] reason=error: {}", userId, err.getMessage());
                    }
                });
                
                ws.accept();
            })
            .onFailure(err -> {
                log.warn("WebSocket auth failed: {}", err.getMessage());
                ws.reject(401);
            });
    }

    private String getQueryParam(String query, String key) {
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=");
            if (kv.length == 2 && kv[0].equals(key)) {
                return kv[1];
            }
        }
        return null;
    }
}
