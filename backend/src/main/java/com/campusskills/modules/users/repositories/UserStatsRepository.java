package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.UserStats;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class UserStatsRepository {
    private final MongoClient client;
    private static final String COLLECTION = "user_stats";

    public UserStatsRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createStats(UserStats stats) {
        long now = System.currentTimeMillis();
        stats.setCreatedAt(now);
        stats.setUpdatedAt(now);
        JsonObject doc = JsonObject.mapFrom(stats);
        doc.remove("_id");
        return client.insert(COLLECTION, doc);
    }

    public Future<UserStats> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(UserStats.class);
        });
    }
    public Future<Boolean> updateRatings(String userId, Double ratingAvg, Integer ratingCount) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("ratingAvg", ratingAvg)
            .put("ratingCount", ratingCount)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }
}
