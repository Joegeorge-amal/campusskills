package com.campusskills.modules.exchanges.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.exchanges.models.Exchange;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import com.campusskills.shared.constants.ExchangeStatus;
import java.util.stream.Collectors;

public class ExchangeRepository {

    private static final String COLLECTION = "exchange_requests";
    private final MongoClient client;

    public ExchangeRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createRequest(Exchange exchange) {
        long now = System.currentTimeMillis();
        exchange.setCreatedAt(now);
        exchange.setUpdatedAt(now);

        JsonObject document = JsonObject.mapFrom(exchange);
        if (document.getString("_id") == null) {
            document.remove("_id");
        }

        return client.save(COLLECTION, document);
    }

    public Future<List<Exchange>> fetchUserRequests(String userId) {
        JsonObject query = new JsonObject().put("$or", new JsonArray()
                .add(new JsonObject().put("requesterId", userId))
                .add(new JsonObject().put("receiverId", userId)));

        return client.find(COLLECTION, query)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Exchange.class))
                        .collect(Collectors.toList()));
    }

    public Future<Exchange> getExchangeById(String exchangeId) {
        JsonObject query = new JsonObject().put("_id", exchangeId);
        return client.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(Exchange.class) : null);
    }

    public Future<Boolean> updateStatus(String exchangeId, String status) {
        JsonObject query = new JsonObject().put("_id", exchangeId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("status", status)
                .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocMatched() > 0);
    }

    public Future<Boolean> hasActiveRequest(String requesterId, String receiverId, String listingId) {
        JsonObject query = new JsonObject()
                .put("requesterId", requesterId)
                .put("receiverId", receiverId)
                .put("listingId", listingId)
                .put("status", new JsonObject().put("$in", new JsonArray().add(ExchangeStatus.PENDING.name()).add(ExchangeStatus.ACCEPTED.name())));

        return client.find(COLLECTION, query).map(list -> !list.isEmpty());
    }
}
