package com.campusskills.modules.exchangerequests.services;

import com.campusskills.modules.exchangerequests.models.ExchangeRequest;
import com.campusskills.modules.exchangerequests.repositories.ExchangeRequestRepository;
import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.modules.chats.services.ChatService;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.shared.constants.ChatSourceType;
import com.campusskills.shared.constants.ChatStatus;
import com.campusskills.shared.constants.RequestStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.core.eventbus.EventBus;
import com.campusskills.shared.constants.MessageType;

import java.util.Arrays;

public class ExchangeRequestService {

    private final ExchangeRequestRepository repository;
    private final ChatService chatService;
    private final ChatRepository chatRepository;
    private final UserProfileRepository userProfileRepository;
    private final EventBus eventBus;

    public ExchangeRequestService(ExchangeRequestRepository repository, ChatService chatService, ChatRepository chatRepository, UserProfileRepository userProfileRepository, EventBus eventBus) {
        this.repository = repository;
        this.chatService = chatService;
        this.chatRepository = chatRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventBus = eventBus;
    }

    private void publishSystemMessage(String chatId, String messageText) {
        if (chatId == null) return;
        JsonObject msg = new JsonObject()
                .put("chatId", chatId)
                .put("senderId", "SYSTEM")
                .put("message", messageText)
                .put("type", MessageType.SYSTEM.name());
        eventBus.send("internal.message.create", msg);
    }

    private void publishNotification(String userId, String type, String title, String message, String sourceType, String sourceId) {
        JsonObject notification = new JsonObject()
                .put("userId", userId)
                .put("type", type)
                .put("title", title)
                .put("message", message)
                .put("sourceType", sourceType)
                .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", notification);
    }

    public Future<JsonObject> createRequest(ExchangeRequest request, String authId) {
        if (request.getListingId() == null || request.getListingId().isEmpty()) {
            return Future.<JsonObject>failedFuture("listingId is required");
        }
        if (request.getReceiverId() == null || request.getReceiverId().equals(authId)) {
            return Future.<JsonObject>failedFuture("Invalid receiverId");
        }

        request.setSenderId(authId);
        request.setStatus(RequestStatus.PENDING);

        return repository.createRequest(request).compose(requestId -> {
            return chatRepository.findActiveChatBetweenUsers(authId, request.getReceiverId()).compose(existingChat -> {
                if (existingChat != null) {
                    // Reuse existing active chat
                    return repository.updateStatusAndChatId(requestId, RequestStatus.PENDING, existingChat.getId()).map(v -> {
                        publishSystemMessage(existingChat.getId(), "A new exchange request has been sent for this listing.");
                        return new JsonObject().put("requestId", requestId).put("chatId", existingChat.getId());
                    });
                } else {
                    // Spawn new pending chat
                    Chat chat = new Chat();
                    chat.setSourceType(ChatSourceType.EXCHANGE_REQUEST);
                    chat.setSourceId(requestId);
                    chat.setListingId(request.getListingId());
                    chat.setParticipants(Arrays.asList(authId, request.getReceiverId()));
                    chat.setStatus(ChatStatus.PENDING);

                    return chatService.createChat(chat, authId).compose(chatRes -> {
                        String chatId = chatRes.getString("chatId");
                        return repository.updateStatusAndChatId(requestId, RequestStatus.PENDING, chatId).map(v -> 
                            new JsonObject().put("requestId", requestId).put("chatId", chatId)
                        );
                    });
                }
            }).compose(result -> {
                return userProfileRepository.findByUserId(authId).map(sender -> {
                    String senderName = (sender != null && sender.getDisplayName() != null) ? sender.getDisplayName() : "Someone";
                    publishNotification(
                        request.getReceiverId(),
                        "EXCHANGE_REQUEST_RECEIVED",
                        "New Exchange Request",
                        senderName + " submitted a request for your listing.",
                        "EXCHANGE_REQUEST",
                        requestId
                    );
                    return result;
                });
            });
        });
    }

    public Future<Void> acceptRequest(String requestId, String authId) {
        return repository.findById(requestId).compose(req -> {
            if (req == null) return Future.<Void>failedFuture("NOT_FOUND");
            if (!req.getReceiverId().equals(authId)) return Future.<Void>failedFuture("FORBIDDEN");
            if (req.getStatus() != RequestStatus.PENDING) return Future.<Void>failedFuture("Request is not PENDING");

            return repository.updateStatus(requestId, RequestStatus.ACCEPTED).compose(v -> 
                chatRepository.updateChatStatus(req.getChatId(), ChatStatus.ACTIVE.name())
            ).compose(v -> {
                publishSystemMessage(req.getChatId(), "The exchange request has been accepted.");
                
                return userProfileRepository.findByUserId(authId).map(receiver -> {
                    String ownerName = (receiver != null && receiver.getDisplayName() != null) ? receiver.getDisplayName() : "Someone";
                    publishNotification(
                        req.getSenderId(),
                        "EXCHANGE_REQUEST_ACCEPTED",
                        "Exchange Request Accepted",
                        ownerName + " accepted your exchange request.",
                        "EXCHANGE_REQUEST",
                        requestId
                    );
                    return null;
                });
            }).mapEmpty();
        });
    }

    public Future<Void> rejectRequest(String requestId, String authId) {
        return repository.findById(requestId).compose(req -> {
            if (req == null) return Future.<Void>failedFuture("NOT_FOUND");
            if (!req.getReceiverId().equals(authId)) return Future.<Void>failedFuture("FORBIDDEN");
            if (req.getStatus() != RequestStatus.PENDING) return Future.<Void>failedFuture("Request is not PENDING");

            return repository.updateStatus(requestId, RequestStatus.REJECTED).compose(v -> {
                return chatRepository.findById(req.getChatId()).compose(chat -> {
                    if (chat != null && chat.getSourceType() == ChatSourceType.EXCHANGE_REQUEST && requestId.equals(chat.getSourceId())) {
                        return chatRepository.updateChatStatus(req.getChatId(), ChatStatus.REJECTED.name());
                    } else {
                        publishSystemMessage(req.getChatId(), "The exchange request was rejected.");
                        return Future.succeededFuture(false);
                    }
                });
            }).compose(v -> {
                return userProfileRepository.findByUserId(authId).map(receiver -> {
                    String ownerName = (receiver != null && receiver.getDisplayName() != null) ? receiver.getDisplayName() : "Someone";
                    publishNotification(
                        req.getSenderId(),
                        "EXCHANGE_REQUEST_REJECTED",
                        "Exchange Request Rejected",
                        ownerName + " rejected your exchange request.",
                        "EXCHANGE_REQUEST",
                        requestId
                    );
                    return null;
                });
            }).mapEmpty();
        });
    }

    public Future<JsonObject> getUserRequests(String authId, int page, int limit) {
        int skip = (page - 1) * limit;
        return repository.countUserRequests(authId).compose(total -> 
            repository.fetchUserRequests(authId, skip, limit).map(list -> {
                io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();
                list.forEach(r -> items.add(JsonObject.mapFrom(r)));
                return new JsonObject()
                    .put("items", items)
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", total);
            })
        );
    }
}
