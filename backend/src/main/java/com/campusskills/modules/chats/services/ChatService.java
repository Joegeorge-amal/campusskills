package com.campusskills.modules.chats.services;

import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.shared.constants.ChatStatus;
import io.vertx.core.Future;

import java.util.List;

import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.shared.constants.ExchangeStatus;
import io.vertx.core.json.JsonObject;

public class ChatService {
    private final ChatRepository repository;
    private final ExchangeRepository exchangeRepository;

    public ChatService(ChatRepository repository, ExchangeRepository exchangeRepository) {
        this.repository = repository;
        this.exchangeRepository = exchangeRepository;
    }

    public Future<JsonObject> createChat(Chat chat, String authId) {
        if (chat.getParticipants() == null || chat.getParticipants().isEmpty()) {
            return Future.failedFuture("participants list is required");
        }

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
            chat.setStatus(ChatStatus.REQUEST);
        }

        return repository.findExistingChat(chat.getListingId(), uniqueParticipants).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("CHAT_ALREADY_EXISTS");
            }

            String receiverId = uniqueParticipants.stream()
                .filter(id -> !id.equals(authId))
                .findFirst().orElse(null);

            if (receiverId == null) {
                return Future.failedFuture("Could not determine receiverId");
            }

            Exchange exchange = new Exchange();
            exchange.setRequesterId(authId);
            exchange.setReceiverId(receiverId);
            exchange.setListingId(chat.getListingId());
            exchange.setStatus(ExchangeStatus.PENDING);
            exchange.setOptionalMessage("Automatic exchange request generated from chat creation");

            return exchangeRepository.createRequest(exchange).compose(exchangeId -> {
                chat.setExchangeId(exchangeId);
                chat.setExchangeStatus(ExchangeStatus.PENDING);
                
                return repository.createChat(chat).map(chatId -> {
                    return new JsonObject()
                        .put("chatId", chatId)
                        .put("chatStatus", chat.getStatus().name())
                        .put("exchangeId", exchangeId)
                        .put("exchangeStatus", exchange.getStatus().name());
                });
            });
        });
    }

    public Future<List<Chat>> getUserChats(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserChats(userId);
    }
}
