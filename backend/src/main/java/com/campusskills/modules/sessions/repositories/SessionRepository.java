package com.campusskills.modules.sessions.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.sessions.models.Session;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class SessionRepository {

    private static final String COLLECTION = "sessions";
    private final MongoClient client;

    public SessionRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createSession(Session session) {
        long now = System.currentTimeMillis();
        session.setCreatedAt(now);
        session.setUpdatedAt(now);

        JsonObject document = JsonObject.mapFrom(session);
        if (document.getString("_id") == null) {
            document.remove("_id");
        }

        return client.save(COLLECTION, document);
    }

    public Future<List<Session>> fetchUserSessions(String userId) {
        JsonObject query = new JsonObject().put("$or", new JsonArray()
                .add(new JsonObject().put("teacherId", userId))
                .add(new JsonObject().put("studentId", userId)));

        return client.find(COLLECTION, query)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Session.class))
                        .collect(Collectors.toList()));
    }

    public Future<Session> getSessionById(String sessionId) {
        JsonObject query = new JsonObject().put("_id", sessionId);
        return client.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(Session.class) : null);
    }

    public Future<Boolean> updateSessionFields(String sessionId, JsonObject updates) {
        updates.put("updatedAt", System.currentTimeMillis());
        JsonObject query = new JsonObject().put("_id", sessionId);
        JsonObject update = new JsonObject().put("$set", updates);

        return client.updateCollection(COLLECTION, query, update)
                .map(res -> res.getDocMatched() > 0);
    }
}
