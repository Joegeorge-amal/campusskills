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
        } catch (Exception e) {
            System.err.println("[BROADCAST ERROR] Failed to broadcast NEW_MESSAGE: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        try {
            WebSocketEventType type;
            try {
                type = WebSocketEventType.valueOf(eventType);
            } catch (IllegalArgumentException e) {
                System.err.println("[BROADCAST WARNING] Unrecognized WebSocketEventType: " + eventType + ". Defaulting to SESSION_UPDATE.");
                type = WebSocketEventType.SESSION_UPDATE;
            }

            JsonObject event = new WebSocketMessageBuilder()
                    .type(type)
                    .payload(new JsonObject().put("session", JsonObject.mapFrom(session)))
                    .build();

            ConnectionManager.sendMessage(session.getTeacherId(), event);
            ConnectionManager.sendMessage(session.getStudentId(), event);
        } catch (Exception e) {
            System.err.println("[BROADCAST ERROR] Failed to broadcast " + eventType + " for session " + session.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void broadcastExchangeEvent(String eventType, com.campusskills.modules.exchanges.models.Exchange exchange) {
        try {
            WebSocketEventType type;
            try {
                type = WebSocketEventType.valueOf(eventType);
            } catch (IllegalArgumentException e) {
                System.err.println("[BROADCAST WARNING] Unrecognized WebSocketEventType: " + eventType + ". Defaulting to CHAT_UPDATE.");
                type = WebSocketEventType.CHAT_UPDATE;
            }

            JsonObject event = new WebSocketMessageBuilder()
                    .type(type)
                    .payload(new JsonObject().put("exchange", JsonObject.mapFrom(exchange)))
                    .build();

            ConnectionManager.sendMessage(exchange.getRequesterId(), event);
            ConnectionManager.sendMessage(exchange.getReceiverId(), event);
        } catch (Exception e) {
            System.err.println("[BROADCAST ERROR] Failed to broadcast " + eventType + " for exchange " + exchange.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
