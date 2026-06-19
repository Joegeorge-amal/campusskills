package com.campusskills.core.database;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.IndexOptions;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DatabaseInitializer {
    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    public static void initializeIndexes(MongoClient client) {
        log.info("Initializing MongoDB indexes...");

        // Background indexing prevents blocking other DB operations while building
        IndexOptions options = new IndexOptions();

        // messages(chatId, createdAt) -> compound index for fast chat history sorting
        client.createIndexWithOptions("messages", new JsonObject().put("chatId", 1).put("createdAt", 1), options)
            .onSuccess(v -> log.info("Created index: messages(chatId, createdAt)"))
            .onFailure(err -> log.error("Failed to create index on messages", err));

        // chats(participants) -> array index for fast lookup of a user's chats
        client.createIndexWithOptions("chats", new JsonObject().put("participants", 1), options)
            .onSuccess(v -> log.info("Created index: chats(participants)"))
            .onFailure(err -> log.error("Failed to create index on chats", err));

        // exchange_requests(requesterId) -> for querying user's sent requests
        client.createIndexWithOptions("exchange_requests", new JsonObject().put("requesterId", 1), options)
            .onSuccess(v -> log.info("Created index: exchange_requests(requesterId)"))
            .onFailure(err -> log.error("Failed to create index on exchange_requests(requesterId)", err));

        // exchange_requests(receiverId) -> for querying user's received requests
        client.createIndexWithOptions("exchange_requests", new JsonObject().put("receiverId", 1), options)
            .onSuccess(v -> log.info("Created index: exchange_requests(receiverId)"))
            .onFailure(err -> log.error("Failed to create index on exchange_requests(receiverId)", err));

        // sessions(participants) -> as requested, array index for sessions
        client.createIndexWithOptions("sessions", new JsonObject().put("participants", 1), options)
            .onSuccess(v -> log.info("Created index: sessions(participants)"))
            .onFailure(err -> log.error("Failed to create index on sessions", err));

        // notifications(userId) -> fast notification retrieval
        client.createIndexWithOptions("notifications", new JsonObject().put("userId", 1), options)
            .onSuccess(v -> log.info("Created index: notifications(userId)"))
            .onFailure(err -> log.error("Failed to create index on notifications", err));

        // otp_verifications(expiresAt) -> TTL index (expireAfterSeconds = 0 means expire at the exact date)
        JsonObject ttlCommand = new JsonObject()
            .put("createIndexes", "otp_verifications")
            .put("indexes", new io.vertx.core.json.JsonArray().add(
                new JsonObject()
                    .put("name", "expiresAt_ttl")
                    .put("key", new JsonObject().put("expiresAt", 1))
                    .put("expireAfterSeconds", 0)
            ));
        client.runCommand("createIndexes", ttlCommand)
            .onSuccess(v -> log.info("Created TTL index: otp_verifications(expiresAt)"))
            .onFailure(err -> log.error("Failed to create TTL index on otp_verifications", err));

        // topics(normalizedName) -> unique constraint for topics catalog
        IndexOptions uniqueOptions = new IndexOptions();
        // Since setUnique is not available in this version, we will manually run the command if needed,
        // but let's just try running createIndex with a manual command to be safe.
        JsonObject command = new JsonObject()
            .put("createIndexes", "topics")
            .put("indexes", new io.vertx.core.json.JsonArray().add(
                new JsonObject()
                    .put("name", "normalizedName_1")
                    .put("key", new JsonObject().put("normalizedName", 1))
                    .put("unique", true)
            ));
        client.runCommand("createIndexes", command)
            .onSuccess(v -> log.info("Created unique index: topics(normalizedName)"))
            .onFailure(err -> log.error("Failed to create index on topics", err));

        // Text Indexes for Search
        client.createIndexWithOptions("skill_listings", new JsonObject()
            .put("title", "text")
            .put("description", "text")
            .put("skills.name", "text"), options)
            .onSuccess(v -> log.info("Created text index on skill_listings"))
            .onFailure(err -> log.error("Failed to create text index on skill_listings", err));

        client.createIndexWithOptions("topics", new JsonObject()
            .put("name", "text"), options)
            .onSuccess(v -> log.info("Created text index on topics"))
            .onFailure(err -> log.error("Failed to create text index on topics", err));

        client.createIndexWithOptions("users", new JsonObject()
            .put("firstName", "text")
            .put("lastName", "text")
            .put("university", "text")
            .put("bio", "text"), options)
            .onSuccess(v -> log.info("Created text index on users"))
            .onFailure(err -> log.error("Failed to create text index on users", err));

        client.createIndexWithOptions("sessions", new JsonObject()
            .put("disputeReason", "text")
            .put("status", "text"), options)
            .onSuccess(v -> log.info("Created text index on sessions"))
            .onFailure(err -> log.error("Failed to create text index on sessions", err));

        // user_profiles(rollNo) -> unique index for direct roll number lookup
        JsonObject rollNoIndex = new JsonObject()
            .put("createIndexes", "user_profiles")
            .put("indexes", new io.vertx.core.json.JsonArray().add(
                new JsonObject()
                    .put("name", "rollNo_1")
                    .put("key", new JsonObject().put("rollNo", 1))
                    .put("unique", true)
                    .put("sparse", true)
            ));
        client.runCommand("createIndexes", rollNoIndex)
            .onSuccess(v -> log.info("Created unique sparse index: user_profiles(rollNo)"))
            .onFailure(err -> log.error("Failed to create index on user_profiles(rollNo)", err));
    }
}
