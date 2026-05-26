package com.campusskills.modules.chats.services;

import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.repositories.ChatRepository;
import io.vertx.core.Future;

import java.util.List;

public class ChatService {
    private final ChatRepository repository;

    public ChatService(ChatRepository repository) {
        this.repository = repository;
    }

    public Future<String> createChat(Chat chat) {
        if (chat.getUser1Id() == null || chat.getUser2Id() == null) {
            return Future.failedFuture("user1Id and user2Id are required");
        }
        if (chat.getStatus() == null) {
            chat.setStatus("REQUEST");
        }
        return repository.createChat(chat);
    }

    public Future<List<Chat>> getUserChats(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserChats(userId);
    }
}
