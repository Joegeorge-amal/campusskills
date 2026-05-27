package com.campusskills.modules.exchanges.services;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import io.vertx.core.Future;

import java.util.UUID;
import com.campusskills.shared.constants.ExchangeStatus;

import java.util.List;

import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.shared.constants.ChatStatus;

public class ExchangeService {

    private final ExchangeRepository repository;
    private final ChatRepository chatRepository;

    public ExchangeService(ExchangeRepository repository, ChatRepository chatRepository) {
        this.repository = repository;
        this.chatRepository = chatRepository;
    }

    public Future<String> createRequest(Exchange exchange) {
        if (exchange.getListingId() == null || exchange.getListingId().trim().isEmpty() ||
            exchange.getRequesterId() == null || exchange.getRequesterId().trim().isEmpty() ||
            exchange.getReceiverId() == null || exchange.getReceiverId().trim().isEmpty()) {
            return Future.failedFuture("listingId, requesterId, and receiverId are required");
        }
        
        if (exchange.getRequesterId().equals(exchange.getReceiverId())) {
            return Future.failedFuture("SELF_REQUEST");
        }

        if (exchange.getOptionalMessage() != null) {
            String msg = exchange.getOptionalMessage().trim();
            if (msg.length() > 1000) {
                return Future.failedFuture("optionalMessage cannot exceed 1000 characters");
            }
            exchange.setOptionalMessage(msg);
        }

        return repository.hasActiveRequest(exchange.getRequesterId(), exchange.getReceiverId(), exchange.getListingId())
                .compose(exists -> {
                    if (exists) {
                        return Future.failedFuture("DUPLICATE_ACTIVE_REQUEST");
                    }
                    exchange.setStatus(ExchangeStatus.PENDING);
                    return repository.createRequest(exchange);
                });
    }

    public Future<List<Exchange>> getUserRequests(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserRequests(userId);
    }

    public Future<Void> acceptRequest(String exchangeId) {
        if (exchangeId == null || exchangeId.trim().isEmpty()) {
            return Future.failedFuture("exchangeId is required");
        }
        return repository.getExchangeById(exchangeId).compose(exchange -> {
            if (exchange == null) return Future.failedFuture("EXCHANGE_NOT_FOUND");
            if (exchange.getStatus() != ExchangeStatus.PENDING) return Future.failedFuture("INVALID_STATUS_TRANSITION");
            return repository.updateStatus(exchangeId, ExchangeStatus.ACCEPTED.name()).compose(updated -> {
                if (!updated) return Future.failedFuture("EXCHANGE_NOT_FOUND");
                
                // Update corresponding chat status
                if (chatRepository != null) {
                    chatRepository.updateChatStatusByExchangeId(exchangeId, ChatStatus.ACTIVE.name(), ExchangeStatus.ACCEPTED.name());
                }
                
                exchange.setStatus(ExchangeStatus.ACCEPTED);
                com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                
                return Future.succeededFuture();
            });
        });
    }

    public Future<Void> rejectRequest(String exchangeId) {
        if (exchangeId == null || exchangeId.trim().isEmpty()) {
            return Future.failedFuture("exchangeId is required");
        }
        return repository.getExchangeById(exchangeId).compose(exchange -> {
            if (exchange == null) return Future.failedFuture("EXCHANGE_NOT_FOUND");
            if (exchange.getStatus() != ExchangeStatus.PENDING) return Future.failedFuture("INVALID_STATUS_TRANSITION");
            return repository.updateStatus(exchangeId, ExchangeStatus.REJECTED.name()).compose(updated -> {
                if (!updated) return Future.failedFuture("EXCHANGE_NOT_FOUND");

                // Update corresponding chat status
                if (chatRepository != null) {
                    chatRepository.updateChatStatusByExchangeId(exchangeId, ChatStatus.CLOSED.name(), ExchangeStatus.REJECTED.name());
                }

                exchange.setStatus(ExchangeStatus.REJECTED);
                com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);

                return Future.succeededFuture();
            });
        });
    }
}
