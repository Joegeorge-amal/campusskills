package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.PasswordResetToken;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class PasswordResetTokenRepository {
    private final MongoClient client;
    public static final String COLLECTION = "password_reset_tokens";

    public PasswordResetTokenRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> create(PasswordResetToken token) {
        JsonObject doc = JsonObject.mapFrom(token);
        doc.remove("_id");
        if (token.getExpiresAt() != null) {
            String isoDate = java.time.Instant.ofEpochMilli(token.getExpiresAt()).toString();
            doc.put("expiresAt", new JsonObject().put("$date", isoDate));
        }
        return client.insert(COLLECTION, doc);
    }

    public Future<PasswordResetToken> findByTokenHash(String tokenHash) {
        JsonObject query = new JsonObject().put("tokenHash", tokenHash);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            if (doc.getValue("expiresAt") instanceof JsonObject) {
                JsonObject expiresAtObj = doc.getJsonObject("expiresAt");
                if (expiresAtObj.containsKey("$date")) {
                    try {
                        String isoDate = expiresAtObj.getString("$date");
                        long millis = java.time.Instant.parse(isoDate).toEpochMilli();
                        doc.put("expiresAt", millis);
                    } catch (Exception e) {
                        Object val = expiresAtObj.getValue("$date");
                        if (val instanceof Number) {
                            doc.put("expiresAt", ((Number) val).longValue());
                        }
                    }
                }
            }
            return doc.mapTo(PasswordResetToken.class);
        });
    }

    public Future<Void> deleteById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.removeDocument(COLLECTION, query).mapEmpty();
    }
    
    public Future<Void> deleteByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.removeDocuments(COLLECTION, query).mapEmpty();
    }
}
