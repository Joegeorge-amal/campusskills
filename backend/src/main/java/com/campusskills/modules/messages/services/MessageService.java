package com.campusskills.modules.messages.services;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.messages.repositories.MessageRepository;
import io.vertx.core.Future;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageService {
    private static final Logger log = LoggerFactory.getLogger(MessageService.class);
    private final MessageRepository repository;
    private final TypingIndicatorService typingService;
    private final io.vertx.core.eventbus.EventBus eventBus;

    public MessageService(MessageRepository repository, TypingIndicatorService typingService, io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = repository;
        this.typingService = typingService;
        this.eventBus = eventBus;
    }

    public Future<String> createMessage(Message message) {
        if (message.getChatId() == null || message.getSenderId() == null || message.getMessage() == null) {
            return Future.failedFuture("chatId, senderId, and message fields are required");
        }
        String content = message.getMessage().trim();
        if (content.isEmpty()) {
            return Future.failedFuture("Message cannot be empty or whitespace only");
        }
        if (content.length() > 2000) {
            return Future.failedFuture("Message exceeds 2000 characters");
        }
        
        return repository.getChatById(message.getChatId()).compose(chat -> {
            if (chat == null) {
                return Future.failedFuture("CHAT_NOT_FOUND");
            }
            io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
            boolean isSystem = "system".equals(message.getSenderId());
            if (!isSystem && (participantsArray == null || !participantsArray.contains(message.getSenderId()))) {
                return Future.failedFuture("UNAUTHORIZED_SENDER");
            }
            
            String status = chat.getString("status");
            if (status == null || !status.equals(com.campusskills.shared.constants.ChatStatus.ACTIVE.name())) {
                return Future.failedFuture("CHAT_NOT_ACTIVE");
            }
            
            java.util.List<String> participantList = participantsArray.stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList());
            
            message.setMessage(content); // Store trimmed content
            return repository.createMessage(message).onSuccess(id -> {
                message.setId(id); // Set the DB-generated ID before broadcasting
                
                // Unhide the chat for all participants since a new message arrived
                new com.campusskills.modules.chats.repositories.ChatRepository()
                    .unhideChatForParticipants(message.getChatId(), participantList)
                    .onFailure(err -> log.error("Failed to unhide chat {}", message.getChatId(), err));
                
                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
                typingService.clearTypingState(message.getChatId(), message.getSenderId(), participantList);
                
                if (eventBus != null) {
                    new com.campusskills.modules.users.repositories.UserProfileRepository().findByUserId(message.getSenderId())
                        .onSuccess(senderProfile -> {
                            String senderName = senderProfile != null ? senderProfile.getName() : "Someone";
                            for (String participantId : participantList) {
                                if (!participantId.equals(message.getSenderId())) {
                                    io.vertx.core.json.JsonObject payload = new io.vertx.core.json.JsonObject()
                                        .put("userId", participantId)
                                        .put("type", "NEW_MESSAGE")
                                        .put("title", "New Message")
                                        .put("message", "You have a new message.")
                                        .put("sourceType", "CHAT")
                                        .put("sourceId", message.getChatId())
                                        .put("senderName", senderName);
                                    eventBus.send("internal.notification.create", payload);
                                }
                            }
                        })
                        .onFailure(err -> {
                            for (String participantId : participantList) {
                                if (!participantId.equals(message.getSenderId())) {
                                    io.vertx.core.json.JsonObject payload = new io.vertx.core.json.JsonObject()
                                        .put("userId", participantId)
                                        .put("type", "NEW_MESSAGE")
                                        .put("title", "New Message")
                                        .put("message", "You have a new message.")
                                        .put("sourceType", "CHAT")
                                        .put("sourceId", message.getChatId());
                                    eventBus.send("internal.notification.create", payload);
                                }
                            }
                        });
                }
            });
        });
    }

    public Future<io.vertx.core.json.JsonObject> getChatMessages(String chatId, String authId, int page, int limit) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return Future.failedFuture("chatId is required");
        }
        if (authId == null || authId.trim().isEmpty()) {
            return Future.failedFuture("authId is required");
        }
        int skip = (page - 1) * limit;

        return repository.getChatById(chatId).compose(chat -> {
            if (chat == null) {
                return Future.failedFuture("CHAT_NOT_FOUND");
            }
            io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
            if (participantsArray == null || !participantsArray.contains(authId)) {
                log.warn("[RETRIEVAL] Unauthorized message access for chat {} by User {}", chatId, authId);
                return Future.failedFuture("UNAUTHORIZED: User is not a participant of this chat");
            }

            io.vertx.core.json.JsonObject clearedAtMap = chat.getJsonObject("clearedAt");
            Long clearedAt = clearedAtMap != null ? clearedAtMap.getLong(authId) : null;

            return repository.countMessagesByChatId(chatId, clearedAt).compose(total -> 
                repository.fetchChatMessages(chatId, skip, limit, clearedAt).map(list -> {
                    java.util.Collections.reverse(list);
                    io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();
                    list.forEach(msg -> items.add(io.vertx.core.json.JsonObject.mapFrom(msg)));
                    return new io.vertx.core.json.JsonObject()
                        .put("items", items)
                        .put("page", page)
                        .put("limit", limit)
                        .put("total", total);
                })
            );
        });
    }

    public Future<Void> markAsRead(String messageId, String authId) {
        if (messageId == null || messageId.trim().isEmpty()) {
            return Future.failedFuture("messageId is required");
        }
        if (authId == null || authId.trim().isEmpty()) {
            return Future.failedFuture("authId is required");
        }

        return repository.getMessageById(messageId).compose(message -> {
            if (message == null) {
                return Future.failedFuture("MESSAGE_NOT_FOUND");
            }
            if (authId.equals(message.getSenderId())) {
                return Future.failedFuture("UNAUTHORIZED: Cannot mark own message as read");
            }

            if (message.getIsRead() != null && message.getIsRead()) {
                // Idempotent read behavior: already marked as read
                return Future.succeededFuture();
            }

            return repository.getChatById(message.getChatId()).compose(chat -> {
                if (chat == null) {
                    return Future.failedFuture("CHAT_NOT_FOUND");
                }

                io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
                if (participantsArray == null || !participantsArray.contains(authId)) {
                    log.warn("[RETRIEVAL ERROR] Unauthorized read receipt attempt for message {} by User {}", messageId, authId);
                    return Future.failedFuture("UNAUTHORIZED: User is not a participant of this chat");
                }
                
                java.util.List<String> participantList = participantsArray.stream()
                    .map(Object::toString)
                    .collect(java.util.stream.Collectors.toList());

                Long readAt = System.currentTimeMillis();
                
                return repository.markMessageAsRead(messageId, readAt).compose(updated -> {
                    if (updated) {
                        com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageRead(messageId, message.getChatId(), authId, readAt, participantList);
                    }
                    return Future.succeededFuture();
                });
            });
        });
    }

    public Future<Void> editMessage(String messageId, String authId, String newText) {
        if (messageId == null || messageId.trim().isEmpty()) return Future.failedFuture("messageId is required");
        if (authId == null || authId.trim().isEmpty()) return Future.failedFuture("authId is required");
        if (newText == null || newText.trim().isEmpty()) return Future.failedFuture("New text is required");
        if (newText.length() > 2000) return Future.failedFuture("Message exceeds 2000 characters");

        return repository.getMessageById(messageId).compose(message -> {
            if (message == null) return Future.failedFuture("MESSAGE_NOT_FOUND");
            if (!authId.equals(message.getSenderId())) return Future.failedFuture("UNAUTHORIZED: Cannot edit someone else's message");
            if (message.getIsDeleted() != null && message.getIsDeleted()) return Future.failedFuture("Cannot edit a deleted message");

            long now = System.currentTimeMillis();
            long createdAt = message.getCreatedAt() != null ? message.getCreatedAt() : 0L;
            if ((now - createdAt) > 10 * 60 * 1000) {
                return Future.failedFuture("EDIT_WINDOW_EXPIRED");
            }

            return repository.editMessage(messageId, newText.trim(), now).compose(updated -> {
                if (updated) {
                    message.setMessage(newText.trim());
                    message.setEditedAt(now);
                    return repository.getChatById(message.getChatId()).compose(chat -> {
                        if (chat != null) {
                            io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
                            java.util.List<String> participantList = participantsArray.stream()
                                    .map(Object::toString)
                                    .collect(java.util.stream.Collectors.toList());
                            com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageEdited(message, participantList);
                        }
                        return Future.succeededFuture();
                    });
                }
                return Future.failedFuture("Failed to edit message");
            });
        });
    }

    public Future<Void> deleteMessage(String messageId, String authId) {
        if (messageId == null || messageId.trim().isEmpty()) return Future.failedFuture("messageId is required");
        if (authId == null || authId.trim().isEmpty()) return Future.failedFuture("authId is required");

        return repository.getMessageById(messageId).compose(message -> {
            if (message == null) return Future.failedFuture("MESSAGE_NOT_FOUND");
            if (!authId.equals(message.getSenderId())) return Future.failedFuture("UNAUTHORIZED: Cannot delete someone else's message");
            if (message.getIsDeleted() != null && message.getIsDeleted()) return Future.succeededFuture(); // Idempotent

            long now = System.currentTimeMillis();
            long createdAt = message.getCreatedAt() != null ? message.getCreatedAt() : 0L;
            if ((now - createdAt) > 15 * 60 * 1000) {
                return Future.failedFuture("DELETE_WINDOW_EXPIRED");
            }

            return repository.softDeleteMessage(messageId, now).compose(updated -> {
                if (updated) {
                    message.setIsDeleted(true);
                    message.setDeletedAt(now);
                    message.setMessage("This message was deleted.");
                    return repository.getChatById(message.getChatId()).compose(chat -> {
                        if (chat != null) {
                            io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
                            java.util.List<String> participantList = participantsArray.stream()
                                    .map(Object::toString)
                                    .collect(java.util.stream.Collectors.toList());
                            com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageDeleted(message, participantList);
                        }
                        return Future.succeededFuture();
                    });
                }
                return Future.failedFuture("Failed to delete message");
            });
        });
    }

    public Future<Void> markAsDelivered(String messageId, String deliveredTo) {
        if (messageId == null || messageId.trim().isEmpty()) {
            return Future.failedFuture("messageId is required");
        }
        return repository.getMessageById(messageId).compose(message -> {
            if (message == null) {
                return Future.failedFuture("Message not found");
            }
            if (message.getSenderId().equals(deliveredTo)) {
                return Future.succeededFuture();
            }
            return repository.getChatById(message.getChatId()).compose(chat -> {
                if (chat == null) {
                    return Future.failedFuture("Chat not found");
                }
                
                java.util.List<String> participantList = ((io.vertx.core.json.JsonArray) chat.getJsonArray("participants"))
                    .stream()
                    .map(Object::toString)
                    .collect(java.util.stream.Collectors.toList());

                Long deliveredAt = System.currentTimeMillis();
                
                return repository.markMessageAsDelivered(messageId, deliveredAt).compose(updated -> {
                    if (updated) {
                        com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageDelivered(messageId, message.getChatId(), deliveredTo, deliveredAt, participantList);
                    }
                    return Future.succeededFuture();
                });
            });
        });
    }

    public Future<Void> markChatAsRead(String chatId, String authId) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return Future.failedFuture("chatId is required");
        }
        if (authId == null || authId.trim().isEmpty()) {
            return Future.failedFuture("authId is required");
        }

        return repository.getChatById(chatId).compose(chat -> {
            if (chat == null) {
                return Future.failedFuture("CHAT_NOT_FOUND");
            }
            io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
            if (participantsArray == null || !participantsArray.contains(authId)) {
                return Future.failedFuture("UNAUTHORIZED: User is not a participant of this chat");
            }

            Long readAt = System.currentTimeMillis();
            return repository.markChatMessagesAsRead(chatId, authId, readAt).compose(v -> {
                // Clear unread notifications for this chat for the current user
                return new com.campusskills.modules.notifications.repositories.NotificationRepository()
                    .markChatNotificationsAsRead(authId, chatId)
                    .map(modifiedCount -> {
                        log.info("[MessageService] Cleared " + modifiedCount + " notifications for chat " + chatId + " for user " + authId);
                        
                        // Broadcast chat read to all participants so sender gets blue ticks
                        java.util.List<String> participantList = participantsArray.stream()
                                .map(Object::toString)
                                .collect(java.util.stream.Collectors.toList());
                        com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageRead(null, chatId, authId, readAt, participantList);

                        return (Void) null;
                    })
                    .recover(err -> {
                        log.warn("[MessageService] Failed to clear notifications for chat " + chatId, err);
                        return Future.succeededFuture();
                    })
                    .mapEmpty();
            });
        });
    }
}
