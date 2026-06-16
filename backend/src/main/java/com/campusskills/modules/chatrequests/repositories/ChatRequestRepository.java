package com.campusskills.modules.chatrequests.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.chatrequests.models.ChatRequest;
import com.campusskills.shared.constants.RequestStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ChatRequestRepository {

    private static final String COLLECTION = "chat_requests";
    private final MongoClient client;

    public ChatRequestRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createRequest(ChatRequest request) {
        long now = System.currentTimeMillis();
        request.setCreatedAt(now);
        request.setUpdatedAt(now);
        
        JsonObject document = JsonObject.mapFrom(request);
        document.remove("_id");
        
        return client.save(COLLECTION, document);
    }

    public Future<ChatRequest> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(ChatRequest.class));
    }

    public Future<Boolean> updateStatusAndChatId(String id, RequestStatus status, String chatId) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("chatId", chatId)
            .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateStatus(String id, RequestStatus status) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<List<ChatRequest>> fetchUserRequests(String userId, java.util.Set<String> blockedUsers, int skip, int limit) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("receiverId", userId)));
        
        if (blockedUsers != null && !blockedUsers.isEmpty()) {
            io.vertx.core.json.JsonArray blockedArr = new io.vertx.core.json.JsonArray(new java.util.ArrayList<>(blockedUsers));
            query.put("senderId", new JsonObject().put("$nin", blockedArr));
            query.put("receiverId", new JsonObject().put("$nin", blockedArr));
        }
        
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSort(new JsonObject().put("updatedAt", -1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream().map(json -> json.mapTo(ChatRequest.class)).collect(Collectors.toList()));
    }
    
    public Future<Long> countUserRequests(String userId, java.util.Set<String> blockedUsers) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("receiverId", userId)));
            
        if (blockedUsers != null && !blockedUsers.isEmpty()) {
            io.vertx.core.json.JsonArray blockedArr = new io.vertx.core.json.JsonArray(new java.util.ArrayList<>(blockedUsers));
            query.put("senderId", new JsonObject().put("$nin", blockedArr));
            query.put("receiverId", new JsonObject().put("$nin", blockedArr));
        }
        return client.count(COLLECTION, query);
    }

    public Future<ChatRequest> findPendingRequestBetweenUsers(String userA, String userB) {
        JsonObject query = new JsonObject()
            .put("status", RequestStatus.PENDING.name())
            .put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("senderId", userA).put("receiverId", userB))
                .add(new JsonObject().put("senderId", userB).put("receiverId", userA))
            );
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(ChatRequest.class));
    }
}
