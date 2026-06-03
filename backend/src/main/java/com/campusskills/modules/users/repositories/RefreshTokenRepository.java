package com.campusskills.modules.users.repositories;

import com.campusskills.modules.users.models.RefreshToken;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class RefreshTokenRepository {
    private final MongoClient mongoClient;
    private static final String COLLECTION = "refresh_tokens";

    public RefreshTokenRepository() {
        this.mongoClient = com.campusskills.core.database.MongoManager.getClient();
    }

    public Future<String> create(RefreshToken token) {
        token.setCreatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(token);
        doc.remove("_id");

        return mongoClient.insert(COLLECTION, doc);
    }

    public Future<RefreshToken> findByTokenHash(String tokenHash) {
        JsonObject query = new JsonObject().put("tokenHash", tokenHash);
        return mongoClient.findOne(COLLECTION, query, null)
            .map(json -> json != null ? json.mapTo(RefreshToken.class) : null);
    }

    public Future<Void> delete(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return mongoClient.removeDocument(COLLECTION, query)
            .mapEmpty();
    }
    
    public Future<Void> deleteByTokenHash(String tokenHash) {
        JsonObject query = new JsonObject().put("tokenHash", tokenHash);
        return mongoClient.removeDocument(COLLECTION, query)
            .mapEmpty();
    }

    public Future<Void> revokeAllForUser(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return mongoClient.removeDocuments(COLLECTION, query)
            .mapEmpty();
    }
}
