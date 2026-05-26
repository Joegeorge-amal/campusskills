package com.campusskills.core.database;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MongoManager {
    private static final Logger log = LoggerFactory.getLogger(MongoManager.class);
    private static MongoClient client;

    public static void init(Vertx vertx, JsonObject config) {
        if (client == null) {
            client = MongoClient.createShared(vertx, config);
            log.info("MongoDB client initialized with db_name: {}", config.getString("db_name", "test"));
        }
    }

    public static MongoClient getClient() {
        if (client == null) {
            throw new IllegalStateException("MongoClient is not initialized");
        }
        return client;
    }
}
