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
            String user1Id = chat.getString("user1Id");
            String user2Id = chat.getString("user2Id");
            if (!message.getSenderId().equals(user1Id) && !message.getSenderId().equals(user2Id)) {
                return Future.failedFuture("UNAUTHORIZED_SENDER");
            }
            
            message.setMessage(content); // Store trimmed content
            return repository.createMessage(message).onSuccess(id -> {
                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, user1Id, user2Id);
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
