package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.UserStats;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.HashMap;

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
            Object idObj = doc.getValue("_id");
            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                doc.put("_id", ((JsonObject) idObj).getString("$oid"));
            }
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

    public Future<Boolean> incrementSessionsCompleted(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$inc", new JsonObject().put("sessionsCompleted", 1))
            .put("$set", new JsonObject().put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> incrementSessionsTotalMinutes(String userId, int minutes) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$inc", new JsonObject().put("totalMinutes", minutes))
            .put("$set", new JsonObject().put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateStats(UserStats stats) {
        stats.setUpdatedAt(System.currentTimeMillis());
        JsonObject query = new JsonObject().put("_id", stats.getId());
        JsonObject doc = JsonObject.mapFrom(stats);
        doc.remove("_id"); // Vertx update uses $set for the whole document? Actually, save does full replacement
        return client.save(COLLECTION, JsonObject.mapFrom(stats)).map(res -> true);
    }

    public Future<Void> recordActivity(String userId) {
        if (userId == null) return Future.failedFuture("User ID is required");

        return findByUserId(userId).compose(stats -> {
            if (stats == null) return Future.failedFuture("User stats not found");

            Map<String, Integer> counts = stats.getDailyActivityCounts();
            if (counts == null) {
                counts = new HashMap<>();
            }

            LocalDate today = LocalDate.now();
            String todayStr = today.format(DateTimeFormatter.ISO_LOCAL_DATE);

            // Increment today's count
            counts.put(todayStr, counts.getOrDefault(todayStr, 0) + 1);

            // Prune data older than 180 days (6 months)
            counts.entrySet().removeIf(entry -> {
                try {
                    LocalDate date = LocalDate.parse(entry.getKey(), DateTimeFormatter.ISO_LOCAL_DATE);
                    return ChronoUnit.DAYS.between(date, today) > 180;
                } catch (Exception e) {
                    return true; // remove invalid dates
                }
            });

            stats.setDailyActivityCounts(counts);
            return updateStats(stats).mapEmpty();
        });
    }
}
