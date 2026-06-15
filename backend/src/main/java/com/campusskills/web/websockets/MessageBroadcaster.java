package com.campusskills.web.websockets;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.sessions.models.Session;
import io.vertx.core.json.JsonObject;
import com.campusskills.shared.constants.WebSocketEventType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageBroadcaster {
    private static final Logger log = LoggerFactory.getLogger(MessageBroadcaster.class);

    public static void broadcastNewMessage(Message message, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("_id", message.getId())
                    .put("chatId", message.getChatId())
                    .put("senderId", message.getSenderId())
                    .put("message", message.getMessage())
                    .put("messageType", message.getType() != null ? message.getType() : "USER")
                    .put("sessionId", message.getSessionId())
                    .put("replyToMessageId", message.getReplyToMessageId())
                    .put("isRead", false)
                    .put("isDelivered", false)
                    .put("createdAt", message.getCreatedAt());

            if (message.getTempId() != null) {
                eventPayload.put("tempId", message.getTempId());
            }

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.NEW_MESSAGE)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast NEW_MESSAGE", e);
        }
    }

    public static void broadcastMessageEdited(Message message, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("messageId", message.getId())
                    .put("chatId", message.getChatId())
                    .put("message", message.getMessage())
                    .put("editedAt", message.getEditedAt());

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.MESSAGE_EDITED)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast MESSAGE_EDITED", e);
        }
    }

    public static void broadcastMessageDeleted(Message message, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("messageId", message.getId())
                    .put("chatId", message.getChatId())
                    .put("isDeleted", true)
                    .put("message", message.getMessage())
                    .put("deletedAt", message.getDeletedAt());

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.MESSAGE_DELETED)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast MESSAGE_DELETED", e);
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
            log.error("[BROADCAST WARN] Failed to broadcast MESSAGE_READ", e);
        }
    }

    public static void broadcastMessageDelivered(String messageId, String chatId, String deliveredTo, Long deliveredAt, java.util.List<String> participants) {
        try {
            JsonObject eventPayload = new JsonObject()
                    .put("messageId", messageId)
                    .put("chatId", chatId)
                    .put("deliveredTo", deliveredTo)
                    .put("deliveredAt", deliveredAt);

            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.MESSAGE_DELIVERED)
                    .payload(eventPayload)
                    .build();

            for (String participant : participants) {
                ConnectionManager.sendMessage(participant, event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast MESSAGE_DELIVERED", e);
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
            log.error("[BROADCAST WARN] Failed to broadcast {}", typeStr, e);
        }
    }

    public static void broadcastSessionEvent(String eventType, Session session) {
        try {
            JsonObject event = new JsonObject()
                    .put("type", eventType)
                    .put("payload", JsonObject.mapFrom(session));
            
            // Broadcast to teacher and student
            if (session.getTeacherId() != null) {
                ConnectionManager.sendMessage(session.getTeacherId(), event);
            }
            if (session.getStudentId() != null) {
                ConnectionManager.sendMessage(session.getStudentId(), event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast {} for session {}", eventType, session.getId(), e);
        }
    }
}
