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

public class ChatService {
    private final ChatRepository repository;
    private final MessageRepository messageRepository;
    private final com.campusskills.modules.users.repositories.UserRepository userRepository;

    public ChatService(ChatRepository repository, MessageRepository messageRepository, com.campusskills.modules.users.repositories.UserRepository userRepository) {
        this.repository = repository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
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
            chat.setStatus(ChatStatus.PENDING);
        }
        
        if (chat.getSourceType() == null) {
            chat.setSourceType(ChatSourceType.GENERAL);
        }

        return repository.findExistingChat(chat.getSourceType().name(), chat.getSourceId(), uniqueParticipants).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("CHAT_ALREADY_EXISTS");
            }

            return repository.createChat(chat).map(chatId -> {
                System.out.println(String.format("[LIFECYCLE] Chat CREATED | chatId=%s sourceType=%s sourceId=%s authenticatedUserId=%s", 
                    chatId, chat.getSourceType(), chat.getSourceId(), authId));
                return new JsonObject()
                    .put("chatId", chatId)
                    .put("chatStatus", chat.getStatus().name())
                    .put("sourceType", chat.getSourceType().name())
                    .put("sourceId", chat.getSourceId());
            });
        });
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

        return matchingUserIdsFuture.compose(matchingUserIds -> {
            // If user searched for a name and NO users matched, return empty results immediately
            if (matchingUserIds != null && matchingUserIds.isEmpty()) {
                return Future.succeededFuture(new JsonObject()
                    .put("items", new JsonArray())
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", 0L));
            }

            return repository.countUserChats(userId, statusFilter, matchingUserIds).compose(total -> 
                repository.fetchUserChats(userId, statusFilter, matchingUserIds, skip, limit).compose(chats -> {
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
                        
                        Future<Void> lastMsgFut = messageRepository.findLastMessageByChatId(chat.getId()).map(lastMessage -> {
                            if (lastMessage != null) {
                                chatJson.put("lastMessagePreview", lastMessage.getMessage());
                                chatJson.put("lastMessageAt", lastMessage.getCreatedAt());
                            }
                            return null;
                        });
                        
                        Future<Void> unreadCountFut = messageRepository.countUnreadMessagesForUser(chat.getId(), userId).map(count -> {
                            chatJson.put("unreadCount", count != null ? count : 0L);
                            return null;
                        });
                        
                        futures.add(CompositeFuture.all(lastMsgFut, unreadCountFut).mapEmpty());
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
}
