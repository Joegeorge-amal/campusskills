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
    }
}
