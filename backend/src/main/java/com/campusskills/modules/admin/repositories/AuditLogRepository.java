package com.campusskills.modules.admin.repositories;

import com.campusskills.modules.admin.models.AuditLog;
import com.campusskills.core.database.MongoManager;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class AuditLogRepository {
    private final MongoClient client;
    private static final String COLLECTION = "audit_logs";

    public AuditLogRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createLog(AuditLog log) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(System.currentTimeMillis());
        }
        JsonObject doc = JsonObject.mapFrom(log);
        doc.remove("_id"); // Ensure auto-generation of ObjectId
        return client.save(COLLECTION, doc);
    }

    private JsonObject buildQuery(String q, String action, String actorId, String targetId, Long startDate, Long endDate) {
        JsonObject query = new JsonObject();
        
        if (q != null && !q.trim().isEmpty()) {
            JsonArray orConditions = new JsonArray();
            JsonObject regex = new JsonObject().put("$regex", q).put("$options", "i");
            orConditions.add(new JsonObject().put("actorName", regex));
            orConditions.add(new JsonObject().put("actorEmail", regex));
            orConditions.add(new JsonObject().put("targetName", regex));
            orConditions.add(new JsonObject().put("targetEmail", regex));
            query.put("$or", orConditions);
        }
        
        if (action != null && !action.trim().isEmpty()) {
            query.put("action", action);
        }

        if (actorId != null && !actorId.trim().isEmpty()) {
            query.put("actorId", actorId);
        }

        if (targetId != null && !targetId.trim().isEmpty()) {
            query.put("targetId", targetId);
        }
        
        if (startDate != null || endDate != null) {
            JsonObject dateRange = new JsonObject();
            if (startDate != null) {
                dateRange.put("$gte", startDate);
            }
            if (endDate != null) {
                dateRange.put("$lte", endDate);
            }
            query.put("timestamp", dateRange);
        }
        
        return query;
    }

    public Future<List<AuditLog>> searchLogs(String q, String action, String actorId, String targetId, Long startDate, Long endDate, int page, int limit) {
        int skip = (page - 1) * limit;
        JsonObject query = buildQuery(q, action, actorId, targetId, startDate, endDate);
        
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSkip(skip)
                .setLimit(limit)
                .setSort(new JsonObject().put("timestamp", -1)); // Newest first
        
        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(AuditLog.class))
                        .collect(Collectors.toList()));
    }

    public Future<Long> countLogs(String q, String action, String actorId, String targetId, Long startDate, Long endDate) {
        JsonObject query = buildQuery(q, action, actorId, targetId, startDate, endDate);
        return client.count(COLLECTION, query);
    }
}
