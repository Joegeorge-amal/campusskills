package com.campusskills.modules.messages.services;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.messages.repositories.MessageRepository;
import io.vertx.core.Future;

import java.util.List;

public class MessageService {
    private final MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
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
            
            java.util.List<String> participantList = participantsArray.stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList());
            
            message.setMessage(content); // Store trimmed content
            return repository.createMessage(message).onSuccess(id -> {
                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
            });
        });
    }

    public Future<List<Message>> getChatMessages(String chatId, int limit, int skip) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return Future.failedFuture("chatId is required");
        }
        if (limit <= 0 || limit > 100) limit = 50;
        if (skip < 0) skip = 0;
        
        return repository.fetchChatMessages(chatId, limit, skip);
    }
}
