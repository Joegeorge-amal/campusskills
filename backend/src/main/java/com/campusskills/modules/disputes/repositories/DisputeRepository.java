package com.campusskills.modules.disputes.repositories;

import com.campusskills.modules.disputes.models.Dispute;
import com.campusskills.shared.constants.DisputeStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import java.util.List;
import java.util.stream.Collectors;

public class DisputeRepository {

    private final MongoClient client;
    private final String COLLECTION = "disputes";

    public DisputeRepository(MongoClient client) {
        this.client = client;
    }

    public Future<String> createDispute(Dispute dispute) {
        JsonObject doc = JsonObject.mapFrom(dispute);
        doc.remove("_id"); // Let Mongo generate ID
        long now = System.currentTimeMillis();
        doc.put("createdAt", now).put("updatedAt", now);
        
        return client.save(COLLECTION, doc);
    }

    public Future<Dispute> getDisputeById(String id) {
        return client.findOne(COLLECTION, new JsonObject().put("_id", id), null)
            .map(res -> res != null ? res.mapTo(Dispute.class) : null);
    }

    public Future<List<Dispute>> getDisputesByUser(String userId) {
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("reporterId", userId))
            .add(new JsonObject().put("reportedId", userId)));
            
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
            .setSort(new JsonObject().put("createdAt", -1));
            
        return client.findWithOptions(COLLECTION, query, options)
            .map(res -> res.stream().map(d -> d.mapTo(Dispute.class)).collect(Collectors.toList()));
    }

    public Future<List<Dispute>> getDisputesBySession(String sessionId) {
        JsonObject query = new JsonObject().put("sessionId", sessionId);
        return client.find(COLLECTION, query)
            .map(res -> res.stream().map(d -> d.mapTo(Dispute.class)).collect(Collectors.toList()));
    }

    public Future<Boolean> updateDisputeStatus(String id, DisputeStatus status) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update)
            .map(res -> res.getDocModified() > 0);
    }
    
    public Future<Boolean> addAdminNotes(String id, String notes) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("adminNotes", notes)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update)
            .map(res -> res.getDocModified() > 0);
    }

    public Future<List<Dispute>> getOpenDisputes() {
        JsonObject query = new JsonObject().put("status", DisputeStatus.OPEN.name());
        return client.find(COLLECTION, query)
            .map(res -> res.stream().map(d -> d.mapTo(Dispute.class)).collect(Collectors.toList()));
    }
}
