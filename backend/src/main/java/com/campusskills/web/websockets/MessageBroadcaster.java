package com.campusskills.web.websockets;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.sessions.models.Session;
import io.vertx.core.json.JsonObject;

public class MessageBroadcaster {

    public static void broadcastNewMessage(Message message, java.util.List<String> participants) {
        JsonObject eventPayload = new JsonObject()
                .put("chatId", message.getChatId())
                .put("senderId", message.getSenderId())
                .put("message", message.getMessage())
                .put("messageType", message.getType() != null ? message.getType() : "TEXT")
                .put("sessionId", message.getSessionId())
                .put("createdAt", message.getCreatedAt());

        JsonObject event = new JsonObject()
                .put("type", "NEW_MESSAGE")
                .put("timestamp", System.currentTimeMillis())
                .put("payload", eventPayload);

        for (String participant : participants) {
            ConnectionManager.sendMessage(participant, event);
        }
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        JsonObject event = new JsonObject()
                .put("type", eventType)
                .put("timestamp", System.currentTimeMillis())
                .put("payload", new JsonObject().put("session", JsonObject.mapFrom(session)));

        ConnectionManager.sendMessage(session.getTeacherId(), event);
        ConnectionManager.sendMessage(session.getStudentId(), event);
    }
}
