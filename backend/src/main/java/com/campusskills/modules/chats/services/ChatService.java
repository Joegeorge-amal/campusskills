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
        if (chat.getParticipants() == null || chat.getParticipants().isEmpty()) {
            return Future.failedFuture("participants list is required");
        }

        // Deduplicate and sort
        List<String> uniqueParticipants = chat.getParticipants().stream()
                .filter(p -> p != null && !p.trim().isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());

        if (uniqueParticipants.size() != 2) {
            return Future.failedFuture("Chat must have exactly 2 unique participants");
        }
        
        chat.setParticipants(uniqueParticipants);

        if (chat.getStatus() == null) {
            chat.setStatus("REQUEST");
        }

        return repository.findExistingChat(chat.getListingId(), uniqueParticipants).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("CHAT_ALREADY_EXISTS");
            }
            return repository.createChat(chat);
        });
    }

    public Future<List<Chat>> getUserChats(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserChats(userId);
    }
}
