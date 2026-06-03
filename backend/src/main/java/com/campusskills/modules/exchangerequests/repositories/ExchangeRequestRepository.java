package com.campusskills.modules.exchangerequests.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.exchangerequests.models.ExchangeRequest;
import com.campusskills.shared.constants.RequestStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ExchangeRequestRepository {

    private static final String COLLECTION = "exchange_requests";
    private final MongoClient client;

    public ExchangeRequestRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createRequest(ExchangeRequest request) {
        long now = System.currentTimeMillis();
        request.setCreatedAt(now);
        request.setUpdatedAt(now);
        
        JsonObject document = JsonObject.mapFrom(request);
        document.remove("_id");
        
        return client.save(COLLECTION, document);
    }

    public Future<ExchangeRequest> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(ExchangeRequest.class));
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

    public Future<List<ExchangeRequest>> fetchUserRequests(String userId, int skip, int limit) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("receiverId", userId)));
        
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSort(new JsonObject().put("updatedAt", -1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream().map(json -> json.mapTo(ExchangeRequest.class)).collect(Collectors.toList()));
    }

    public Future<Long> countUserRequests(String userId) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("receiverId", userId)));
        return client.count(COLLECTION, query);
    }
}
