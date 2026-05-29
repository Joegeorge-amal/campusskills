package com.campusskills.modules.messages.services;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.messages.repositories.MessageRepository;
import io.vertx.core.Future;

import java.util.List;

public class MessageService {
    private final MessageRepository repository;
    private final TypingIndicatorService typingService;

    public MessageService(MessageRepository repository, TypingIndicatorService typingService) {
        this.repository = repository;
        this.typingService = typingService;
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
            if (participantsArray == null || !participantsArray.contains(message.getSenderId())) {
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
                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
                typingService.clearTypingState(message.getChatId(), message.getSenderId(), participantList);
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
                System.err.println("[RETRIEVAL] Unauthorized message access for chat " + chatId + " by User " + authId);
                return Future.failedFuture("UNAUTHORIZED: User is not a participant of this chat");
            }

            System.out.println("[RETRIEVAL] User " + authId + " requested messages for chat " + chatId + " | page: " + page + " limit: " + limit);
            
            return repository.countMessagesByChatId(chatId).compose(total -> 
                repository.fetchChatMessages(chatId, skip, limit).map(list -> {
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
                    System.err.println("[RETRIEVAL ERROR] Unauthorized read receipt attempt for message " + messageId + " by User " + authId);
                    return Future.failedFuture("UNAUTHORIZED: User is not a participant of this chat");
                }
                
                java.util.List<String> participantList = participantsArray.stream()
                    .map(Object::toString)
                    .collect(java.util.stream.Collectors.toList());

                Long readAt = System.currentTimeMillis();
                
                return repository.markMessageAsRead(messageId, readAt).compose(updated -> {
                    if (updated) {
                        System.out.println(String.format("[MESSAGE_READ] messageId=%s chatId=%s authenticatedUserId=%s readAt=%d", messageId, message.getChatId(), authId, readAt));
                        com.campusskills.web.websockets.MessageBroadcaster.broadcastMessageRead(messageId, message.getChatId(), authId, readAt, participantList);
                    }
                    return Future.succeededFuture();
                });
            });
        });
    }
}
