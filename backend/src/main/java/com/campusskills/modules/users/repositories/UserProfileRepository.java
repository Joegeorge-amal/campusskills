package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.UserProfile;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class UserProfileRepository {
    private final MongoClient client;
    private static final String COLLECTION = "user_profiles";

    public UserProfileRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createProfile(UserProfile profile) {
        long now = System.currentTimeMillis();
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);
        JsonObject doc = JsonObject.mapFrom(profile);
        doc.remove("_id");
        return client.insert(COLLECTION, doc);
    }

    public Future<UserProfile> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(UserProfile.class);
        });
    }

    public Future<Boolean> updateRatings(String userId, Double averageRating, Integer reviewCount) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("averageRating", averageRating)
            .put("reviewCount", reviewCount)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }
}
