package com.campusskills.modules.chatrequests.services;

import com.campusskills.modules.chatrequests.models.ChatRequest;
import com.campusskills.modules.chatrequests.repositories.ChatRequestRepository;
import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.modules.chats.services.ChatService;
import com.campusskills.shared.constants.ChatSourceType;
import com.campusskills.shared.constants.ChatStatus;
import com.campusskills.shared.constants.RequestStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.core.eventbus.EventBus;
import com.campusskills.shared.constants.MessageType;

import java.util.Arrays;

public class ChatRequestService {

    private final ChatRequestRepository repository;
    private final ChatService chatService;
    private final ChatRepository chatRepository;
    private final EventBus eventBus;

    public ChatRequestService(ChatRequestRepository repository, ChatService chatService, ChatRepository chatRepository, EventBus eventBus) {
        this.repository = repository;
        this.chatService = chatService;
        this.chatRepository = chatRepository;
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

    public Future<JsonObject> createRequest(ChatRequest request, String authId) {
        if (request.getReceiverId() == null || request.getReceiverId().equals(authId)) {
            return Future.<JsonObject>failedFuture("Invalid receiverId");
        }
        request.setSenderId(authId);
        request.setStatus(RequestStatus.PENDING);

        return repository.createRequest(request).compose(requestId -> {
            return chatRepository.findActiveChatBetweenUsers(authId, request.getReceiverId()).compose(existingChat -> {
                if (existingChat != null) {
                    return repository.updateStatusAndChatId(requestId, RequestStatus.PENDING, existingChat.getId()).map(v -> {
                        publishSystemMessage(existingChat.getId(), "A new chat request has been sent.");
                        return new JsonObject().put("requestId", requestId).put("chatId", existingChat.getId());
                    });
                } else {
                    Chat chat = new Chat();
                    chat.setSourceType(ChatSourceType.CHAT_REQUEST);
                    chat.setSourceId(requestId);
                    chat.setParticipants(Arrays.asList(authId, request.getReceiverId()));
                    chat.setStatus(ChatStatus.PENDING);

                    return chatService.createChat(chat, authId).compose(chatRes -> {
                        String chatId = chatRes.getString("chatId");
                        return repository.updateStatusAndChatId(requestId, RequestStatus.PENDING, chatId).map(v -> 
                            new JsonObject().put("requestId", requestId).put("chatId", chatId)
                        );
                    });
                }
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
            ).onSuccess(v -> {
                publishSystemMessage(req.getChatId(), "The chat request has been accepted.");
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
                    if (chat != null && chat.getSourceType() == ChatSourceType.CHAT_REQUEST && requestId.equals(chat.getSourceId())) {
                        return chatRepository.updateChatStatus(req.getChatId(), ChatStatus.REJECTED.name());
                    } else {
                        publishSystemMessage(req.getChatId(), "The chat request was rejected.");
                        return Future.succeededFuture(false);
                    }
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
