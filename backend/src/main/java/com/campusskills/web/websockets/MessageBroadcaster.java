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

        JsonObject event = new WebSocketMessageBuilder()
                .type(WebSocketEventType.NEW_MESSAGE)
                .payload(eventPayload)
                .build();

        for (String participant : participants) {
            ConnectionManager.sendMessage(participant, event);
        }
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        WebSocketEventType type = WebSocketEventType.valueOf(eventType);
        JsonObject event = new WebSocketMessageBuilder()
                .type(type)
                .payload(new JsonObject().put("session", JsonObject.mapFrom(session)))
                .build();

        ConnectionManager.sendMessage(session.getTeacherId(), event);
        ConnectionManager.sendMessage(session.getStudentId(), event);
    }
}
