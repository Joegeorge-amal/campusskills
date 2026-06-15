package com.campusskills.modules.chats.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.chats.models.Chat;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ChatRepository {

    private static final String COLLECTION = "chats";
    private final MongoClient client;

    public ChatRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createChat(Chat chat) {
        long now = System.currentTimeMillis();
        chat.setCreatedAt(now);
        chat.setUpdatedAt(now);
        
        JsonObject document = JsonObject.mapFrom(chat);
        // Remove _id if null so MongoDB auto-generates it
        if (document.getString("_id") == null) {
            document.remove("_id");
        }
        
        return client.save(COLLECTION, document);
    }

    public Future<List<Chat>> fetchUserChats(String userId, String statusFilter, List<String> matchingUserIds, java.util.Set<String> blockedUsers, int skip, int limit) {
        JsonObject query = new JsonObject().put("participants", userId);
        if (statusFilter != null && !statusFilter.isEmpty()) {
            query.put("status", statusFilter);
        }
        
        JsonArray andConditions = new JsonArray();
        
        if (matchingUserIds != null && !matchingUserIds.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", new JsonObject().put("$in", matchingUserIds)));
        }
        
        if (blockedUsers != null && !blockedUsers.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", new JsonObject().put("$nin", new JsonArray(new java.util.ArrayList<>(blockedUsers)))));
        }
        
        if (!andConditions.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", userId));
            if (statusFilter != null && !statusFilter.isEmpty()) {
                andConditions.add(new JsonObject().put("status", statusFilter));
                query.remove("status"); // prevent duplicating condition
            }
            query.remove("participants");
            query.put("$and", andConditions);
        }
        
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSort(new JsonObject().put("updatedAt", -1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Chat.class))
                        .collect(Collectors.toList()));
    }

    public Future<Long> countUserChats(String userId, String statusFilter, List<String> matchingUserIds, java.util.Set<String> blockedUsers) {
        JsonObject query = new JsonObject().put("participants", userId);
        if (statusFilter != null && !statusFilter.isEmpty()) {
            query.put("status", statusFilter);
        }
        
        JsonArray andConditions = new JsonArray();
        
        if (matchingUserIds != null && !matchingUserIds.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", new JsonObject().put("$in", matchingUserIds)));
        }
        
        if (blockedUsers != null && !blockedUsers.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", new JsonObject().put("$nin", new JsonArray(new java.util.ArrayList<>(blockedUsers)))));
        }
        
        if (!andConditions.isEmpty()) {
            andConditions.add(new JsonObject().put("participants", userId));
            if (statusFilter != null && !statusFilter.isEmpty()) {
                andConditions.add(new JsonObject().put("status", statusFilter));
                query.remove("status");
            }
            query.remove("participants");
            query.put("$and", andConditions);
        }
        return client.count(COLLECTION, query);
    }

    public Future<Chat> findExistingChat(String sourceType, String sourceId, List<String> participants) {
        JsonObject query = new JsonObject()
                .put("sourceType", sourceType)
                .put("participants", new JsonObject().put("$size", participants.size()).put("$all", new JsonArray(participants)));
        
        if (sourceId != null) {
            query.put("sourceId", sourceId);
        }
        
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(Chat.class));
    }

    public Future<Chat> findActiveChatBetweenUsers(String userA, String userB) {
        JsonObject query = new JsonObject()
                .put("status", com.campusskills.shared.constants.ChatStatus.ACTIVE.name())
                .put("participants", new JsonObject()
                        .put("$size", 2)
                        .put("$all", new JsonArray().add(userA).add(userB)));
        
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(Chat.class));
    }

    public Future<Boolean> updateChatStatus(String chatId, String chatStatus) {
        JsonObject query = new JsonObject().put("_id", chatId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("status", chatStatus)
                .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update)
                .map(res -> res.getDocModified() > 0);
    }

    public Future<Chat> findById(String chatId) {
        JsonObject query = new JsonObject().put("_id", chatId);
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(Chat.class));
    }

    public Future<Boolean> deleteChat(String chatId) {
        JsonObject query = new JsonObject().put("_id", chatId);
        return client.removeDocument(COLLECTION, query)
                .map(res -> res.getRemovedCount() > 0);
    }
}
