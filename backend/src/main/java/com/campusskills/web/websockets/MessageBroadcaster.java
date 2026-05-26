package com.campusskills.web.websockets;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.sessions.models.Session;
import io.vertx.core.json.JsonObject;

public class MessageBroadcaster {

    public static void broadcastNewMessage(Message message, String user1Id, String user2Id) {
        JsonObject payload = new JsonObject()
                .put("type", "NEW_MESSAGE")
                .put("chatId", message.getChatId())
                .put("senderId", message.getSenderId())
                .put("message", message.getMessage())
                .put("type", message.getType() != null ? message.getType() : "TEXT")
                .put("sessionId", message.getSessionId())
                .put("createdAt", message.getCreatedAt());

        ConnectionManager.sendMessage(user1Id, payload);
        ConnectionManager.sendMessage(user2Id, payload);
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        JsonObject payload = new JsonObject()
                .put("type", eventType)
                .put("session", JsonObject.mapFrom(session));

        ConnectionManager.sendMessage(session.getTeacherId(), payload);
        ConnectionManager.sendMessage(session.getStudentId(), payload);
    }
}
