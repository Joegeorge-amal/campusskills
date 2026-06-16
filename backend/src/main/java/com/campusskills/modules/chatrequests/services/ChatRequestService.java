package com.campusskills.modules.chatrequests.services;

import com.campusskills.modules.chatrequests.models.ChatRequest;
import com.campusskills.modules.chatrequests.repositories.ChatRequestRepository;
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
import com.campusskills.web.websockets.ConnectionManager;
import com.campusskills.web.websockets.WebSocketMessageBuilder;
import com.campusskills.shared.constants.WebSocketEventType;

public class ChatRequestService {

    private final ChatRequestRepository repository;
    private final ChatService chatService;
    private final ChatRepository chatRepository;
    private final UserProfileRepository userProfileRepository;
    private final EventBus eventBus;

    public ChatRequestService(ChatRequestRepository repository, ChatService chatService, ChatRepository chatRepository, UserProfileRepository userProfileRepository, EventBus eventBus) {
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

    private void broadcastWebSocketEvent(String userId, WebSocketEventType type, JsonObject payload) {
        try {
            JsonObject event = new WebSocketMessageBuilder()
                    .type(type)
                    .payload(payload)
                    .build();
            ConnectionManager.broadcastToUser(userId, event);
        } catch (Exception e) {
            // Ignored
        }
    }

    public Future<JsonObject> createRequest(ChatRequest request, String authId) {
        if (request.getReceiverId() == null || request.getReceiverId().equals(authId)) {
            return Future.<JsonObject>failedFuture("Invalid receiverId");
        }
        
        return userProfileRepository.findByUserId(authId).compose(senderProfile -> {
            if (senderProfile != null && senderProfile.getBlockedUsers().contains(request.getReceiverId())) {
                return Future.<JsonObject>failedFuture("FORBIDDEN");
            }
            return userProfileRepository.findByUserId(request.getReceiverId()).compose(receiverProfile -> {
                if (receiverProfile != null && receiverProfile.getBlockedUsers().contains(authId)) {
                    return Future.<JsonObject>failedFuture("FORBIDDEN");
                }
                
                return repository.findPendingRequestBetweenUsers(authId, request.getReceiverId()).compose(pending -> {
                    if (pending != null) {
                        return Future.<JsonObject>failedFuture("A chat request is already pending for this user.");
                    }
                    
                    return chatRepository.findActiveChatBetweenUsers(authId, request.getReceiverId()).compose(existingChat -> {
                        if (existingChat != null) {
                            return Future.<JsonObject>failedFuture("You already have an active chat with this user.");
                        }
                        
                        request.setSenderId(authId);
                        request.setStatus(RequestStatus.PENDING);
                        
                        return repository.createRequest(request).compose(requestId -> {
                            String senderName = (senderProfile != null && senderProfile.getName() != null) ? senderProfile.getName() : "Unknown User";
                            publishNotification(
                                request.getReceiverId(),
                                "NEW_REQUEST",
                                "New Chat Request",
                                senderName + " wants to chat with you.",
                                "CHAT_REQUEST",
                                requestId
                            );

                            JsonObject wsPayload = JsonObject.mapFrom(request);
                            JsonObject profileData = new JsonObject()
                                .put("name", senderName)
                                .put("avatarImg", senderProfile != null ? senderProfile.getProfilePicture() : null);
                            if (senderProfile != null && senderProfile.getAvatarColor() != null) {
                                try {
                                    profileData.put("avatarColor", JsonObject.mapFrom(senderProfile.getAvatarColor()));
                                } catch(Exception e) {
                                    if (senderProfile.getAvatarColor() instanceof java.util.Map) {
                                        profileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)senderProfile.getAvatarColor()));
                                    }
                                }
                            }
                            wsPayload.put("otherUser", profileData);
                            wsPayload.put("id", requestId);
                            
                            broadcastWebSocketEvent(request.getReceiverId(), WebSocketEventType.NEW_REQUEST, wsPayload);

                            JsonObject wsPayloadForInitiator = JsonObject.mapFrom(request);
                            JsonObject receiverProfileData = new JsonObject()
                                .put("name", receiverProfile != null ? receiverProfile.getName() : "Unknown User")
                                .put("avatarImg", receiverProfile != null ? receiverProfile.getProfilePicture() : null);
                            if (receiverProfile != null && receiverProfile.getAvatarColor() != null) {
                                try {
                                    receiverProfileData.put("avatarColor", JsonObject.mapFrom(receiverProfile.getAvatarColor()));
                                } catch(Exception e) {
                                    if (receiverProfile.getAvatarColor() instanceof java.util.Map) {
                                        receiverProfileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)receiverProfile.getAvatarColor()));
                                    }
                                }
                            }
                            wsPayloadForInitiator.put("otherUser", receiverProfileData);
                            wsPayloadForInitiator.put("id", requestId);
                            broadcastWebSocketEvent(request.getSenderId(), WebSocketEventType.NEW_REQUEST, wsPayloadForInitiator);
                            return Future.succeededFuture(new JsonObject().put("requestId", requestId));
                        });
                    });
                });
            });
        });
    }

    public Future<JsonObject> acceptRequest(String requestId, String authId) {
        return repository.findById(requestId).compose(req -> {
            if (req == null) return Future.<JsonObject>failedFuture("NOT_FOUND");
            if (!req.getReceiverId().equals(authId)) return Future.<JsonObject>failedFuture("FORBIDDEN");
            if (req.getStatus() != RequestStatus.PENDING) return Future.<JsonObject>failedFuture("Request is not PENDING");

            Chat chat = new Chat();
            chat.setSourceType(ChatSourceType.CHAT_REQUEST);
            chat.setSourceId(requestId);
            chat.setParticipants(Arrays.asList(req.getSenderId(), authId));
            chat.setStatus(ChatStatus.ACTIVE);

            return chatService.getOrCreateChat(chat, req.getSenderId()).compose(chatRes -> {
                String chatId = chatRes.getString("chatId");
                return repository.updateStatusAndChatId(requestId, RequestStatus.ACCEPTED, chatId).compose(v -> {
                    
                    Future<Void> messageFuture;
                    if (req.getMessage() != null && !req.getMessage().trim().isEmpty()) {
                        JsonObject msgPayload = new JsonObject()
                                .put("chatId", chatId)
                                .put("senderId", req.getSenderId())
                                .put("message", req.getMessage().trim())
                                .put("type", MessageType.USER.name());
                        messageFuture = eventBus.<JsonObject>request("internal.message.create", msgPayload).mapEmpty();
                    } else {
                        messageFuture = Future.succeededFuture();
                    }

                    return messageFuture.compose(v2 -> {
                        return userProfileRepository.findByUserId(authId).map(receiver -> {
                            String receiverName = (receiver != null && receiver.getName() != null) ? receiver.getName() : "Someone";
                            publishNotification(
                                req.getSenderId(),
                                "REQUEST_ACCEPTED",
                                "Chat Request Accepted",
                                receiverName + " accepted your chat request.",
                                "CHAT_REQUEST",
                                requestId
                            );

                            JsonObject wsPayload = JsonObject.mapFrom(req);
                            wsPayload.put("id", requestId);
                            wsPayload.put("status", RequestStatus.ACCEPTED.name());
                            broadcastWebSocketEvent(req.getSenderId(), WebSocketEventType.REQUEST_ACCEPTED, wsPayload);

                            return new JsonObject().put("chatId", chatId);
                        });
                    });
                });
            });
        });
    }

    public Future<Void> rejectRequest(String requestId, String authId) {
        return repository.findById(requestId).compose(req -> {
            if (req == null) return Future.<Void>failedFuture("NOT_FOUND");
            if (!req.getReceiverId().equals(authId)) return Future.<Void>failedFuture("FORBIDDEN");
            if (req.getStatus() != RequestStatus.PENDING) return Future.<Void>failedFuture("Request is not PENDING");

            return repository.updateStatus(requestId, RequestStatus.REJECTED).compose(v -> {
                JsonObject wsPayload = JsonObject.mapFrom(req);
                wsPayload.put("id", requestId);
                wsPayload.put("status", RequestStatus.REJECTED.name());
                broadcastWebSocketEvent(req.getSenderId(), WebSocketEventType.REQUEST_REJECTED, wsPayload);
                return Future.<Void>succeededFuture();
            });
        });
    }

    public Future<JsonObject> getUserRequests(String authId, int page, int limit) {
        int skip = (page - 1) * limit;
        com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        
        Future<java.util.Set<String>> blockedUsersFuture = userProfileRepository.findByUserId(authId).compose(profile -> {
            java.util.Set<String> blockedUsers = new java.util.HashSet<>();
            if (profile != null && profile.getBlockedUsers() != null) {
                blockedUsers.addAll(profile.getBlockedUsers());
            }
            return userProfileRepository.getBlockedByUsers(authId).map(blockedBy -> {
                blockedUsers.addAll(blockedBy);
                return blockedUsers;
            });
        });

        return blockedUsersFuture.compose(blockedUsers -> {
            return repository.countUserRequests(authId, blockedUsers).compose(total -> 
                repository.fetchUserRequests(authId, blockedUsers, skip, limit).compose(list -> {
                if (list.isEmpty()) {
                    return Future.succeededFuture(new JsonObject()
                        .put("items", new io.vertx.core.json.JsonArray())
                        .put("page", page)
                        .put("limit", limit)
                        .put("total", total));
                }

                java.util.List<Future> futures = new java.util.ArrayList<>();
                io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();

                for (com.campusskills.modules.chatrequests.models.ChatRequest r : list) {
                    JsonObject reqJson = JsonObject.mapFrom(r);
                    items.add(reqJson);
                    
                    String otherUserId = r.getSenderId().equals(authId) ? r.getReceiverId() : r.getSenderId();
                    
                    Future<Void> profileFut = userProfileRepository.findByUserId(otherUserId).map(profile -> {
                        if (profile != null) {
                            JsonObject profileData = new JsonObject();
                            profileData.put("name", profile.getName());
                            profileData.put("avatarImg", profile.getProfilePicture());
                            if (profile.getAvatarColor() != null) {
                                try {
                                    profileData.put("avatarColor", io.vertx.core.json.JsonObject.mapFrom(profile.getAvatarColor()));
                                } catch(Exception e) {
                                    if (profile.getAvatarColor() instanceof java.util.Map) {
                                        profileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)profile.getAvatarColor()));
                                    }
                                }
                            }
                            reqJson.put("participantProfile", profileData);
                        }
                        return null;
                    });
                    futures.add(profileFut);
                }

                return io.vertx.core.CompositeFuture.all(futures).map(v -> new JsonObject()
                    .put("items", items)
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", total));
            })
            );
        });
    }
}
