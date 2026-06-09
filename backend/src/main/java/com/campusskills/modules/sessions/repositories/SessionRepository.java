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
        document.remove("_id");

        return client.save(COLLECTION, document);
    }

    public Future<List<Session>> fetchUserSessions(String userId, int skip, int limit) {
        JsonObject query = new JsonObject().put("$or", new JsonArray()
            .add(new JsonObject().put("teacherId", userId))
            .add(new JsonObject().put("studentId", userId))
        );

        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSort(new JsonObject().put("scheduledStart", 1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Session.class))
                        .collect(Collectors.toList()));
    }

    public Future<Long> countUserSessions(String userId) {
        JsonObject query = new JsonObject().put("$or", new JsonArray()
            .add(new JsonObject().put("teacherId", userId))
            .add(new JsonObject().put("studentId", userId))
        );
        return client.count(COLLECTION, query);
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
                .map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> addConfirmation(String sessionId, String userId) {
        JsonObject query = new JsonObject().put("_id", sessionId);
        JsonObject update = new JsonObject().put("$addToSet", new JsonObject().put("confirmedBy", userId))
                                        .put("$set", new JsonObject().put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update)
                .map(res -> res.getDocModified() > 0);
    }

    public Future<Long> autoResolveExpiredSessions() {
        long now = System.currentTimeMillis();
        JsonObject query = new JsonObject()
            .put("status", com.campusskills.shared.constants.SessionStatus.PENDING_CONFIRMATION.name())
            .put("confirmationDeadline", new JsonObject().put("$lt", now));

        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", com.campusskills.shared.constants.SessionStatus.CLOSED_UNCONFIRMED.name())
            .put("updatedAt", now)
        );

        return client.updateCollectionWithOptions(COLLECTION, query, update, new io.vertx.ext.mongo.UpdateOptions().setMulti(true))
                .map(res -> res.getDocModified());
    }
}
