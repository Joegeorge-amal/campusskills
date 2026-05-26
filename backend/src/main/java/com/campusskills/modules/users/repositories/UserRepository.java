package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.User;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class UserRepository {
    
    private final MongoClient client;
    private static final String COLLECTION = "users";

    public UserRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createUser(User user) {
        user.setCreatedAt(System.currentTimeMillis());
        user.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(user);
        doc.remove("_id"); // let mongo generate
        return client.insert(COLLECTION, doc);
    }

    public Future<User> findByEmail(String email) {
        JsonObject query = new JsonObject().put("email", email);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(User.class);
        });
    }

    public Future<User> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(User.class);
        });
    }
}
