package com.campusskills.modules.users.jobs;

import com.campusskills.core.database.MongoManager;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserCleanupJob {
    
    private static final Logger log = LoggerFactory.getLogger(UserCleanupJob.class);
    
    public void start(Vertx vertx) {
        // Run every 30 minutes
        long intervalMs = 30 * 60 * 1000;
        
        vertx.setPeriodic(intervalMs, id -> {
            log.info("Running UserCleanupJob...");
            MongoClient client = MongoManager.getClient();
            
            // Get all active user IDs
            client.find("users", new JsonObject(), res -> {
                if (res.succeeded()) {
                    JsonArray userIds = new JsonArray();
                    for (JsonObject u : res.result()) {
                        userIds.add(u.getString("_id"));
                    }
                    
                    JsonObject userIdQuery = new JsonObject().put("userId", new JsonObject().put("$nin", userIds));
                    JsonObject ownerIdQuery = new JsonObject().put("ownerId", new JsonObject().put("$nin", userIds));
                    
                    // Cleanup user_profiles
                    client.removeDocuments("user_profiles", userIdQuery, r -> {
                        if (r.succeeded() && r.result().getRemovedCount() > 0) {
                            log.info("Cleaned up {} orphaned user_profiles", r.result().getRemovedCount());
                        }
                    });
                    
                    // Cleanup user_stats
                    client.removeDocuments("user_stats", userIdQuery, r -> {
                        if (r.succeeded() && r.result().getRemovedCount() > 0) {
                            log.info("Cleaned up {} orphaned user_stats", r.result().getRemovedCount());
                        }
                    });
                    
                    // Cleanup user_wallets
                    client.removeDocuments("user_wallets", userIdQuery, r -> {
                        if (r.succeeded() && r.result().getRemovedCount() > 0) {
                            log.info("Cleaned up {} orphaned user_wallets", r.result().getRemovedCount());
                        }
                    });
                    
                    // Cleanup skill_listings
                    client.removeDocuments("skill_listings", ownerIdQuery, r -> {
                        if (r.succeeded() && r.result().getRemovedCount() > 0) {
                            log.info("Cleaned up {} orphaned skill_listings", r.result().getRemovedCount());
                        }
                    });
                    
                } else {
                    log.error("Failed to fetch users for cleanup job", res.cause());
                }
            });
        });
    }
}
