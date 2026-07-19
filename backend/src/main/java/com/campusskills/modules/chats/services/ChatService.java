package com.campusskills.modules.chats.services;

import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.shared.constants.ChatStatus;
import com.campusskills.shared.constants.ChatSourceType;
import io.vertx.core.Future;

import java.util.List;

import com.campusskills.modules.messages.repositories.MessageRepository;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.core.CompositeFuture;
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final ChatRepository repository;
    private final MessageRepository messageRepository;
    private final com.campusskills.modules.users.repositories.UserRepository userRepository;

    public ChatService(ChatRepository repository, MessageRepository messageRepository, com.campusskills.modules.users.repositories.UserRepository userRepository) {
        this.repository = repository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public Future<JsonObject> getOrCreateChat(Chat chat, String authId) {
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
            chat.setStatus(ChatStatus.ACTIVE);
        }
        
        if (chat.getSourceType() == null) {
            return Future.failedFuture("Chat sourceType is required (CHAT_REQUEST or EXCHANGE_REQUEST)");
        }

        // 1. Search for an existing active conversation between the two users
        return repository.findActiveChatBetweenUsers(uniqueParticipants.get(0), uniqueParticipants.get(1)).compose(existing -> {
            if (existing != null) {
                log.debug("[LIFECYCLE] Chat REUSED | chatId={} sourceType={} sourceId={} authenticatedUserId={}", 
                    existing.getId(), existing.getSourceType(), existing.getSourceId(), authId);
                return Future.succeededFuture(new JsonObject()
                    .put("chatId", existing.getId())
                    .put("chatStatus", existing.getStatus().name())
                    .put("sourceType", existing.getSourceType().name())
                    .put("sourceId", existing.getSourceId()));
            }

            // 2. Otherwise, check if a chat exists with this source (safety fallback)
            return repository.findExistingChat(chat.getSourceType().name(), chat.getSourceId(), uniqueParticipants).compose(existingSrc -> {
                if (existingSrc != null) {
                    log.debug("[LIFECYCLE] Chat REUSED by source | chatId={} sourceType={} sourceId={} authenticatedUserId={}", 
                        existingSrc.getId(), existingSrc.getSourceType(), existingSrc.getSourceId(), authId);
                    return Future.succeededFuture(new JsonObject()
                        .put("chatId", existingSrc.getId())
                        .put("chatStatus", existingSrc.getStatus().name())
                        .put("sourceType", existingSrc.getSourceType().name())
                        .put("sourceId", existingSrc.getSourceId()));
                }

                // 3. Create a new conversation if none exists
                return repository.createChat(chat).map(chatId -> {
                    log.debug("[LIFECYCLE] Chat CREATED | chatId={} sourceType={} sourceId={} authenticatedUserId={}", 
                        chatId, chat.getSourceType(), chat.getSourceId(), authId);
                    return new JsonObject()
                        .put("chatId", chatId)
                        .put("chatStatus", chat.getStatus().name())
                        .put("sourceType", chat.getSourceType().name())
                        .put("sourceId", chat.getSourceId());
                });
            });
        });
    }

    public Future<JsonObject> createChat(Chat chat, String authId) {
        return getOrCreateChat(chat, authId);
    }

    public Future<JsonObject> getUserChats(String userId, String statusFilter, String q, int page, int limit) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        int skip = (page - 1) * limit;

        Future<List<String>> matchingUserIdsFuture;
        if (q != null && !q.trim().isEmpty()) {
            matchingUserIdsFuture = userRepository.searchUserIdsByName(q);
        } else {
            matchingUserIdsFuture = Future.succeededFuture(null); // null means no text filter
        }

        com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        Future<java.util.Set<String>> blockedUsersFuture = userProfileRepository.findByUserId(userId).compose(profile -> {
            java.util.Set<String> blockedUsers = new java.util.HashSet<>();
            if (profile != null && profile.getBlockedUsers() != null) {
                blockedUsers.addAll(profile.getBlockedUsers());
            }
            return userProfileRepository.getBlockedByUsers(userId).map(blockedBy -> {
                blockedUsers.addAll(blockedBy);
                return blockedUsers;
            });
        });

        return CompositeFuture.all(matchingUserIdsFuture, blockedUsersFuture).compose(cf -> {
            List<String> matchingUserIds = cf.resultAt(0);
            java.util.Set<String> blockedUsers = cf.resultAt(1);

            // If user searched for a name and NO users matched, return empty results immediately
            if (matchingUserIds != null && matchingUserIds.isEmpty()) {
                return Future.succeededFuture(new JsonObject()
                    .put("items", new JsonArray())
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", 0L));
            }

            return repository.countUserChats(userId, statusFilter, matchingUserIds, blockedUsers).compose(total -> 
                repository.fetchUserChats(userId, statusFilter, matchingUserIds, blockedUsers, skip, limit).compose(chats -> {
                    if (chats.isEmpty()) {
                        return Future.succeededFuture(new JsonObject()
                            .put("items", new JsonArray())
                            .put("page", page)
                            .put("limit", limit)
                            .put("total", total));
                    }

                    List<Future> futures = new ArrayList<>();
                    JsonArray items = new JsonArray();

                    for (Chat chat : chats) {
                        JsonObject chatJson = JsonObject.mapFrom(chat);
                        items.add(chatJson);
                        
                        Long clearedAt = chat.getClearedAt() != null ? chat.getClearedAt().get(userId) : null;
                        
                        Future<Void> lastMsgFut = messageRepository.findLastMessageByChatId(chat.getId(), clearedAt).map(lastMessage -> {
                            if (lastMessage != null) {
                                chatJson.put("lastMessagePreview", lastMessage.getMessage());
                                chatJson.put("lastMessageAt", lastMessage.getCreatedAt());
                                chatJson.put("lastMessageSenderId", lastMessage.getSenderId());
                            }
                            return null;
                        });
                        
                        Future<Void> unreadCountFut = messageRepository.countUnreadMessagesForUser(chat.getId(), userId, clearedAt).map(count -> {
                            chatJson.put("unreadCount", count != null ? count : 0L);
                            return null;
                        });
                        
                        String otherParticipantId = chat.getParticipants().stream().filter(p -> !p.equals(userId)).findFirst().orElse(null);
                        Future<Void> profileFut = Future.succeededFuture();
                        if (otherParticipantId != null) {
                            profileFut = userProfileRepository.findByUserId(otherParticipantId).map(profile -> {
                                if (profile != null) {
                                    JsonObject profileData = new JsonObject();
                                    profileData.put("name", profile.getName());
                                    profileData.put("avatarImg", profile.getProfilePicture());
                                    if (profile.getAvatarColor() != null) {
                                        try {
                                            profileData.put("avatarColor", io.vertx.core.json.JsonObject.mapFrom(profile.getAvatarColor()));
                                        } catch(Exception e) {
                                            // Handle case if avatarColor is string/map
                                            if (profile.getAvatarColor() instanceof java.util.Map) {
                                                profileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)profile.getAvatarColor()));
                                            }
                                        }
                                    }
                                    chatJson.put("participantProfile", profileData);
                                    chatJson.put("isOnline", com.campusskills.web.websockets.ConnectionManager.isUserOnline(otherParticipantId));
                                }
                                return null;
                            });
                        }
                        
                        futures.add(CompositeFuture.all(lastMsgFut, unreadCountFut, profileFut).mapEmpty());
                    }

                    return CompositeFuture.all(futures).map(v -> new JsonObject()
                        .put("items", items)
                        .put("page", page)
                        .put("limit", limit)
                        .put("total", total)
                    );
                })
            );
        });
    }

    public Future<Void> deleteChat(String chatId, String userId) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return Future.failedFuture("chatId is required");
        }
        return repository.findById(chatId).compose(chat -> {
            if (chat == null) {
                return Future.failedFuture("CHAT_NOT_FOUND");
            }
            if (!chat.getParticipants().contains(userId)) {
                return Future.failedFuture("UNAUTHORIZED");
            }
            return repository.hideChatForUser(chatId, userId)
                .mapEmpty();
        });
    }
}
