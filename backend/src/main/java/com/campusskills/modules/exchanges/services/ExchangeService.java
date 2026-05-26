package com.campusskills.modules.exchanges.services;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import io.vertx.core.Future;

import java.util.List;

public class ExchangeService {

    private final ExchangeRepository repository;

    public ExchangeService(ExchangeRepository repository) {
        this.repository = repository;
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
                    exchange.setStatus("PENDING");
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
            if (!"PENDING".equals(exchange.getStatus())) return Future.failedFuture("INVALID_STATUS_TRANSITION");
            return repository.updateStatus(exchangeId, "ACCEPTED").compose(updated -> updated ? Future.succeededFuture() : Future.failedFuture("EXCHANGE_NOT_FOUND"));
        });
    }

    public Future<Void> rejectRequest(String exchangeId) {
        if (exchangeId == null || exchangeId.trim().isEmpty()) {
            return Future.failedFuture("exchangeId is required");
        }
        return repository.getExchangeById(exchangeId).compose(exchange -> {
            if (exchange == null) return Future.failedFuture("EXCHANGE_NOT_FOUND");
            if (!"PENDING".equals(exchange.getStatus())) return Future.failedFuture("INVALID_STATUS_TRANSITION");
            return repository.updateStatus(exchangeId, "REJECTED").compose(updated -> updated ? Future.succeededFuture() : Future.failedFuture("EXCHANGE_NOT_FOUND"));
        });
    }
}
