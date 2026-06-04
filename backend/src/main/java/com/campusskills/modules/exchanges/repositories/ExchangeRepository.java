package com.campusskills.modules.exchanges.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.shared.constants.ExchangeStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ExchangeRepository {

    private final MongoClient client;
    private static final String COLLECTION = "exchanges";

    public ExchangeRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createRequest(Exchange request) {
        request.setCreatedAt(System.currentTimeMillis());
        request.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(request);
        doc.remove("_id"); // let mongo generate
        return client.insert(COLLECTION, doc);
    }

    public Future<Exchange> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(Exchange.class);
        });
    }

    public Future<Boolean> updateStatusAndChatId(String id, ExchangeStatus status, String chatId) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("chatId", chatId)
            .put("updatedAt", System.currentTimeMillis())
        );
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateStatus(String id, ExchangeStatus status) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("updatedAt", System.currentTimeMillis())
        );
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<List<Exchange>> findRequestsForUser(String userId) {
        // user is sender or receiver
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("initiatorId", userId))
            .add(new JsonObject().put("receiverId", userId))
        );
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(Exchange.class)).collect(Collectors.toList())
        );
    }

    public Future<Exchange> findPendingRequestBetween(String senderId, String receiverId) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject()
                .put("initiatorId", senderId)
                .put("receiverId", receiverId)
                .put("status", ExchangeStatus.REQUESTED.name()))
            .add(new JsonObject()
                .put("initiatorId", receiverId)
                .put("receiverId", senderId)
                .put("status", ExchangeStatus.REQUESTED.name()))
        );
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(Exchange.class);
        });
    }

    public Future<Long> countUserRequests(String userId) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("senderId", userId))
            .add(new JsonObject().put("initiatorId", userId))
            .add(new JsonObject().put("receiverId", userId)));
        return client.count(COLLECTION, query);
    }
}
