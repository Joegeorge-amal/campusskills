package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public class SessionService {

    private final SessionRepository repository;

    private final io.vertx.core.eventbus.EventBus eventBus;
    private final com.campusskills.modules.users.repositories.UserStatsRepository statsRepository;

    public SessionService(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new SessionRepository();
        this.statsRepository = new com.campusskills.modules.users.repositories.UserStatsRepository();
        this.eventBus = eventBus;
    }

    private void sendNotification(String userId, com.campusskills.shared.constants.NotificationType type, String title, String message, String sourceType, String sourceId) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject()
            .put("userId", userId)
            .put("type", type.name())
            .put("title", title)
            .put("message", message)
            .put("sourceType", sourceType)
            .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", payload);
    }

    // TODO(Future): SESSION_REMINDER notifications can be integrated seamlessly here 
    // without structural changes. We can dispatch a `SESSION_REMINDER` notification 
    // payload to `internal.notification.create` via a background worker or chron job.

    public Future<JsonObject> getUserSessions(String userId, int page, int limit) {
        int skip = (page - 1) * limit;
        return repository.countUserSessions(userId).compose(total -> 
            repository.fetchUserSessions(userId, skip, limit).map(list -> {
                io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();
                list.forEach(req -> items.add(JsonObject.mapFrom(req)));
                return new JsonObject()
                    .put("items", items)
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", total);
            })
        );
    }

    public Future<Session> getSessionByIdAuth(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("Session not found");
            }
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized to view this session");
            }
            return Future.succeededFuture(session);
        });
    }

    public Future<Void> confirmSession(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }

            if (session.getStatus() != SessionStatus.PENDING_CONFIRMATION) {
                return Future.failedFuture("Session is not PENDING_CONFIRMATION");
            }

            return repository.addConfirmation(sessionId, userId).compose(added -> {
                if (session.getConfirmedBy().size() + 1 >= 2) {
                    // Both confirmed
                    JsonObject updates = new JsonObject().put("status", SessionStatus.COMPLETED.name());
                    return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                        // Notify both parties that it is COMPLETED
                        sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been marked as completed.", "SESSION", sessionId);
                        sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been marked as completed.", "SESSION", sessionId);
                        statsRepository.recordActivity(session.getTeacherId());
                        statsRepository.recordActivity(session.getStudentId());
                    }).mapEmpty();
                } else {
                    return Future.succeededFuture();
                }
            });
        });
    }

    public Future<Void> disputeSession(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getStatus() != SessionStatus.PENDING_CONFIRMATION) {
                return Future.failedFuture("Session is not PENDING_CONFIRMATION");
            }

            JsonObject updates = new JsonObject().put("status", SessionStatus.DISPUTED.name());
            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_DISPUTED, "Session Disputed", "The session has been marked as disputed.", "SESSION", sessionId);
                sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_DISPUTED, "Session Disputed", "The session has been marked as disputed.", "SESSION", sessionId);
            }).mapEmpty();
        });
    }
}
