package com.campusskills.modules.admin.repositories;

import com.campusskills.modules.admin.models.AuditLog;
import com.campusskills.core.database.MongoManager;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
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

    public Future<List<AuditLog>> fetchLogs(int page, int limit) {
        int skip = (page - 1) * limit;
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSkip(skip)
                .setLimit(limit)
                .setSort(new JsonObject().put("timestamp", -1)); // Newest first
        
        return client.findWithOptions(COLLECTION, new JsonObject(), options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(AuditLog.class))
                        .collect(Collectors.toList()));
    }
}
