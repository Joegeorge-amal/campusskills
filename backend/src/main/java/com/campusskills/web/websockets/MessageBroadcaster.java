package com.campusskills.web.websockets;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.sessions.models.Session;
import io.vertx.core.json.JsonObject;
import com.campusskills.shared.constants.WebSocketEventType;

public class MessageBroadcaster {

    public static void broadcastNewMessage(Message message, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("chatId", message.getChatId())
                    .put("senderId", message.getSenderId())
                    .put("message", message.getMessage())
                    .put("messageType", message.getType() != null ? message.getType() : "USER")
                    .put("sessionId", message.getSessionId())
                    .put("createdAt", message.getCreatedAt());

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.NEW_MESSAGE)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            System.err.println("[BROADCAST WARN] Failed to broadcast NEW_MESSAGE: " + e.getMessage());
        }
    }

    public static void broadcastMessageRead(String messageId, String chatId, String readBy, Long readAt, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("messageId", messageId)
                    .put("chatId", chatId)
                    .put("readBy", readBy)
                    .put("readAt", readAt);

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.MESSAGE_READ)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            System.err.println("[BROADCAST WARN] Failed to broadcast MESSAGE_READ: " + e.getMessage());
        }
    }

    public static void broadcastTypingEvent(String typeStr, String chatId, String userId, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("chatId", chatId)
                    .put("userId", userId);

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.valueOf(typeStr))
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                if (!participant.equals(userId)) {
                    ConnectionManager.sendMessage(participant, event);
                }
            }
        } catch (Exception e) {
            System.err.println("[BROADCAST WARN] Failed to broadcast " + typeStr + ": " + e.getMessage());
        }
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        try {
            WebSocketEventType type;
            try {
                type = WebSocketEventType.valueOf(eventType);
            } catch (IllegalArgumentException e) {
                System.err.println("[BROADCAST WARN] Unrecognized WebSocketEventType: " + eventType + ". Defaulting to SESSION_UPDATE.");
                type = WebSocketEventType.SESSION_UPDATE;
            }

            JsonObject event = new WebSocketMessageBuilder()
                    .type(type)
                    .payload(new JsonObject().put("session", JsonObject.mapFrom(session)))
                    .build();

            if (session.getParticipants() != null) {
                for (String participantId : session.getParticipants()) {
                    ConnectionManager.sendMessage(participantId, event);
                }
            }
        } catch (Exception e) {
            System.err.println("[BROADCAST WARN] Failed to broadcast " + eventType + " for session " + session.getId() + ": " + e.getMessage());
        }
    }

}
