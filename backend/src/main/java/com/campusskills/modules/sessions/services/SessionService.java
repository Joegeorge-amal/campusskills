package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

import java.util.List;

import io.vertx.core.eventbus.EventBus;

public class SessionService {

    private final EventBus eventBus;
    private final SessionRepository repository;

    public SessionService(EventBus eventBus, SessionRepository repository) {
        this.eventBus = eventBus;
        this.repository = repository;
    }

    private void publishSystemMessage(String chatId, String type, String sessionId, String messageText) {
        if (chatId == null) return;
        JsonObject msg = new JsonObject()
                .put("chatId", chatId)
                .put("senderId", "SYSTEM")
                .put("message", messageText)
                .put("type", type)
                .put("sessionId", sessionId);
        eventBus.send("internal.message.create", msg);
    }

    public Future<String> createSession(Session session, String requesterId) {
        if (session.getExchangeId() == null || session.getTeacherId() == null || session.getStudentId() == null) {
            return Future.failedFuture("exchangeId, teacherId, and studentId are required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        if (!requesterId.equals(session.getStudentId())) {
            return Future.failedFuture("UNAUTHORIZED: Only the student can propose a session");
        }
        
        if (session.getTeacherId().equals(session.getStudentId())) {
            return Future.failedFuture("teacherId and studentId cannot be the same");
        }

        session.setStatus("PROPOSED");
        session.setTeacherConfirmed(false);
        session.setStudentConfirmed(false);
        
        return repository.createSession(session).onSuccess(id -> {
            session.setId(id);
            if (session.getChatId() != null) {
                publishSystemMessage(session.getChatId(), "SESSION_PROPOSED", id, "A session meeting time has been proposed.");
            }
            com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_PROPOSED", session);
        });
    }

    public Future<List<Session>> getUserSessions(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserSessions(userId);
    }

    public Future<Void> acceptSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getTeacherId())) {
                return Future.failedFuture("UNAUTHORIZED: Only the teacher can accept the session proposal");
            }
            if (!"PROPOSED".equals(session.getStatus())) {
                return Future.failedFuture("Session must be PROPOSED to be accepted");
            }
            JsonObject updates = new JsonObject().put("status", "SCHEDULED");
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus("SCHEDULED");
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SESSION_ACCEPTED", sessionId, "Session proposal has been accepted.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_ACCEPTED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> rejectSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getTeacherId())) {
                return Future.failedFuture("UNAUTHORIZED: Only the teacher can reject the session proposal");
            }
            if (!"PROPOSED".equals(session.getStatus())) {
                return Future.failedFuture("Session must be PROPOSED to be rejected");
            }
            JsonObject updates = new JsonObject().put("status", "REJECTED");
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus("REJECTED");
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SESSION_REJECTED", sessionId, "Session proposal has been declined.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_REJECTED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> cancelSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getTeacherId()) && !requesterId.equals(session.getStudentId())) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can cancel the session");
            }
            if (!"PROPOSED".equals(session.getStatus()) && !"SCHEDULED".equals(session.getStatus())) {
                return Future.failedFuture("Only PROPOSED or SCHEDULED sessions can be cancelled");
            }
            JsonObject updates = new JsonObject().put("status", "CANCELLED");
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus("CANCELLED");
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SESSION_CANCELLED", sessionId, "Session has been cancelled.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_CANCELLED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> completeSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getTeacherId())) {
                return Future.failedFuture("UNAUTHORIZED: Only the teacher can complete the session");
            }
            if (!"SCHEDULED".equals(session.getStatus())) {
                return Future.failedFuture("Session must be SCHEDULED to be completed");
            }
            JsonObject updates = new JsonObject()
                    .put("teacherConfirmed", true)
                    .put("status", "COMPLETED");
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus("COMPLETED");
                    session.setTeacherConfirmed(true);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SYSTEM", sessionId, "Session completed by teacher. Waiting for student confirmation.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> confirmSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getStudentId())) {
                return Future.failedFuture("UNAUTHORIZED: Only the student can confirm the session");
            }
            if (!"COMPLETED".equals(session.getStatus())) {
                return Future.failedFuture("Session must be COMPLETED to be confirmed by student");
            }
            JsonObject updates = new JsonObject()
                    .put("studentConfirmed", true);
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStudentConfirmed(true);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SESSION_CONFIRMED", sessionId, "Session has been mutually confirmed.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_CONFIRMED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> disputeSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!requesterId.equals(session.getTeacherId()) && !requesterId.equals(session.getStudentId())) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can dispute the session");
            }
            if (!"SCHEDULED".equals(session.getStatus()) && !"COMPLETED".equals(session.getStatus())) {
                return Future.failedFuture("Only SCHEDULED or COMPLETED sessions can be disputed");
            }
            JsonObject updates = new JsonObject()
                    .put("status", "DISPUTED");
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus("DISPUTED");
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), "SYSTEM", sessionId, "Session has been DISPUTED. An admin will review.");
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_DISPUTED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }
}
