package com.campusskills.modules.exchanges.services;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import io.vertx.core.Future;

import java.util.UUID;
import com.campusskills.shared.constants.ExchangeStatus;

import java.util.List;

import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.shared.constants.ChatStatus;
import io.vertx.core.json.JsonObject;

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

    public Future<JsonObject> getUserRequests(String userId, int page, int limit) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        int skip = (page - 1) * limit;
        System.out.println("[RETRIEVAL] User " + userId + " requested exchanges | page: " + page + " limit: " + limit);
        
        return repository.countUserRequests(userId).compose(total -> 
            repository.fetchUserRequests(userId, skip, limit).map(list -> {
                io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();
                list.forEach(req -> items.add(JsonObject.mapFrom(req)));
                return new JsonObject()
                    .put("items", items)
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", total);
            })
        );
    }

    public Future<Void> acceptRequest(String exchangeId, String authenticatedUserId) {
        if (exchangeId == null || exchangeId.trim().isEmpty()) {
            return Future.failedFuture("exchangeId is required");
        }
        if (authenticatedUserId == null || authenticatedUserId.trim().isEmpty()) {
            return Future.failedFuture("authenticatedUserId is required");
        }
        return repository.getExchangeById(exchangeId).compose(exchange -> {
            if (exchange == null) {
                System.err.println("[EXCHANGE LIFECYCLE] Exchange " + exchangeId + " not found for acceptance");
                return Future.failedFuture("EXCHANGE_NOT_FOUND");
            }
            if (!authenticatedUserId.equals(exchange.getReceiverId())) {
                System.err.println("[EXCHANGE LIFECYCLE] Unauthorized acceptance attempt for Exchange " + exchangeId + " by User " + authenticatedUserId);
                return Future.failedFuture("UNAUTHORIZED: Only the receiver can accept this exchange");
            }
            
            ExchangeStatus previousStatus = exchange.getStatus();
            if (previousStatus != ExchangeStatus.PENDING) {
                System.err.println("[EXCHANGE LIFECYCLE] Invalid transition for Exchange " + exchangeId + " (Current: " + previousStatus + ")");
                return Future.failedFuture("INVALID_STATUS_TRANSITION");
            }
            
            System.out.println("[DEBUG-LIFECYCLE] --- Exchange Acceptance ---");
            System.out.println("[DEBUG-LIFECYCLE] exchangeId: " + exchangeId);
            System.out.println("[DEBUG-LIFECYCLE] authenticatedUserId: " + authenticatedUserId);
            System.out.println("[DEBUG-LIFECYCLE] previous exchange status: " + previousStatus);
            System.out.println("[DEBUG-LIFECYCLE] new exchange status: " + ExchangeStatus.ACCEPTED);
            
            return repository.updateStatus(exchangeId, ExchangeStatus.ACCEPTED.name()).compose(updated -> {
                if (!updated) return Future.failedFuture("EXCHANGE_NOT_FOUND");
                System.out.println("[EXCHANGE LIFECYCLE] Exchange " + exchangeId + " updated to ACCEPTED");
                
                exchange.setStatus(ExchangeStatus.ACCEPTED);
                
                if (chatRepository != null) {
                    System.out.println("[EXCHANGE LIFECYCLE] Triggering Chat update for exchangeId: " + exchangeId);
                    
                    return chatRepository.getChatByExchangeId(exchangeId).compose(chat -> {
                        System.out.println("[DEBUG-LIFECYCLE] --- Chat Synchronization ---");
                        System.out.println("[DEBUG-LIFECYCLE] result of findByExchangeId: " + (chat != null ? "FOUND" : "NOT_FOUND"));
                        if (chat != null) {
                            System.out.println("[DEBUG-LIFECYCLE] located chatId: " + chat.getId());
                            System.out.println("[DEBUG-LIFECYCLE] previous chat status: " + chat.getStatus());
                        }
                        System.out.println("[DEBUG-LIFECYCLE] attempted new chat status: " + ChatStatus.ACTIVE);
                        
                        return chatRepository.updateChatStatusByExchangeId(exchangeId, ChatStatus.ACTIVE.name(), ExchangeStatus.ACCEPTED.name())
                            .compose(chatUpdated -> {
                                System.out.println("[DEBUG-LIFECYCLE] result of chat update/save operation: " + chatUpdated);
                                if (chatUpdated) {
                                    System.out.println("[EXCHANGE LIFECYCLE] Successfully linked Chat transitioned to ACTIVE");
                                } else {
                                    System.err.println("[EXCHANGE LIFECYCLE] WARNING: No linked Chat found for exchangeId: " + exchangeId);
                                }
                                com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                                return Future.succeededFuture((Void) null);
                            })
                            .recover(err -> {
                                System.out.println("[DEBUG-LIFECYCLE] result of chat update/save operation: FAILED (" + err.getMessage() + ")");
                                System.err.println("[EXCHANGE LIFECYCLE] ERROR updating linked Chat for exchangeId " + exchangeId + ": " + err.getMessage());
                                com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                                return Future.succeededFuture((Void) null);
                            });
                    });
                } else {
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                    return Future.succeededFuture((Void) null);
                }
            });
        });
    }

    public Future<Void> rejectRequest(String exchangeId, String authenticatedUserId) {
        if (exchangeId == null || exchangeId.trim().isEmpty()) {
            return Future.failedFuture("exchangeId is required");
        }
        if (authenticatedUserId == null || authenticatedUserId.trim().isEmpty()) {
            return Future.failedFuture("authenticatedUserId is required");
        }
        return repository.getExchangeById(exchangeId).compose(exchange -> {
            if (exchange == null) {
                System.err.println("[EXCHANGE LIFECYCLE] Exchange " + exchangeId + " not found for rejection");
                return Future.failedFuture("EXCHANGE_NOT_FOUND");
            }
            if (!authenticatedUserId.equals(exchange.getReceiverId())) {
                System.err.println("[EXCHANGE LIFECYCLE] Unauthorized rejection attempt for Exchange " + exchangeId + " by User " + authenticatedUserId);
                return Future.failedFuture("UNAUTHORIZED: Only the receiver can reject this exchange");
            }
            if (exchange.getStatus() != ExchangeStatus.PENDING) {
                System.err.println("[EXCHANGE LIFECYCLE] Invalid transition for Exchange " + exchangeId + " (Current: " + exchange.getStatus() + ")");
                return Future.failedFuture("INVALID_STATUS_TRANSITION");
            }
            return repository.updateStatus(exchangeId, ExchangeStatus.REJECTED.name()).compose(updated -> {
                if (!updated) return Future.failedFuture("EXCHANGE_NOT_FOUND");
                System.out.println("[EXCHANGE LIFECYCLE] Exchange " + exchangeId + " updated to REJECTED");
                
                exchange.setStatus(ExchangeStatus.REJECTED);

                if (chatRepository != null) {
                    System.out.println("[EXCHANGE LIFECYCLE] Triggering Chat update for exchangeId: " + exchangeId);
                    return chatRepository.updateChatStatusByExchangeId(exchangeId, ChatStatus.CLOSED.name(), ExchangeStatus.REJECTED.name())
                        .compose(chatUpdated -> {
                            if (chatUpdated) {
                                System.out.println("[EXCHANGE LIFECYCLE] Successfully linked Chat transitioned to CLOSED");
                            } else {
                                System.err.println("[EXCHANGE LIFECYCLE] WARNING: No linked Chat found for exchangeId: " + exchangeId);
                            }
                            com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                            return Future.succeededFuture((Void) null);
                        })
                        .recover(err -> {
                            System.err.println("[EXCHANGE LIFECYCLE] ERROR updating linked Chat for exchangeId " + exchangeId + ": " + err.getMessage());
                            com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                            return Future.succeededFuture((Void) null);
                        });
                } else {
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastExchangeEvent("CHAT_UPDATE", exchange);
                    return Future.succeededFuture((Void) null);
                }
            });
        });
    }
}
