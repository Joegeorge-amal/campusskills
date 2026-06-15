package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.RescheduleProposal;
import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public class SessionService {

    private final SessionRepository repository;
    private final io.vertx.core.eventbus.EventBus eventBus;
    private final com.campusskills.modules.users.repositories.UserStatsRepository statsRepository;
    private final com.campusskills.modules.users.repositories.UserProfileRepository profileRepository;
    private final com.campusskills.modules.listings.repositories.ListingRepository listingRepository;

    public SessionService(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new SessionRepository();
        this.statsRepository = new com.campusskills.modules.users.repositories.UserStatsRepository();
        this.profileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        this.listingRepository = new com.campusskills.modules.listings.repositories.ListingRepository();
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

    private void emitSessionEvent(String sessionId, String type, JsonObject data) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject().put("sessionId", sessionId).put("type", type);
        if (data != null) payload.put("data", data);
        eventBus.publish("ws.sessions." + sessionId, payload);
    }

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

    public Future<Void> markCompletion(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Session must be SCHEDULED to mark completion");
            }

            boolean isTeacher = userId.equals(session.getTeacherId());
            JsonObject updates = new JsonObject();
            if (isTeacher) {
                updates.put("teacherConfirmedCompletion", true);
            } else {
                updates.put("studentConfirmedCompletion", true);
            }

            return repository.updateSessionFields(sessionId, updates).compose(v -> repository.getSessionById(sessionId)).compose(updatedSession -> {
                if (Boolean.TRUE.equals(updatedSession.getTeacherConfirmedCompletion()) && Boolean.TRUE.equals(updatedSession.getStudentConfirmedCompletion())) {
                    JsonObject finalUpdate = new JsonObject().put("status", SessionStatus.COMPLETED.name());
                    return repository.updateSessionFields(sessionId, finalUpdate).onSuccess(v2 -> {
                        sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been completed.", "SESSION", sessionId);
                        sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been completed.", "SESSION", sessionId);
                        statsRepository.recordActivity(session.getTeacherId());
                        statsRepository.recordActivity(session.getStudentId());
                        emitSessionEvent(sessionId, "SESSION_COMPLETED", null);
                    }).mapEmpty();
                } else {
                    emitSessionEvent(sessionId, "COMPLETION_REQUESTED", new JsonObject().put("requestedBy", userId));
                    return Future.succeededFuture();
                }
            });
        });
    }

    public Future<Void> proposeReschedule(String sessionId, String userId, Long newStart, Long newEnd) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Session must be SCHEDULED to propose reschedule");
            }

            JsonObject proposal = new JsonObject()
                .put("proposedByUserId", userId)
                .put("newScheduledStart", newStart)
                .put("newScheduledEnd", newEnd)
                .put("status", "PENDING");

            JsonObject updates = new JsonObject().put("rescheduleProposal", proposal);
            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                emitSessionEvent(sessionId, "RESCHEDULE_PROPOSED", proposal);
            }).mapEmpty();
        });
    }

    public Future<Void> respondToReschedule(String sessionId, String userId, boolean accept) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getRescheduleProposal() == null) {
                return Future.failedFuture("No active reschedule proposal");
            }
            if (session.getRescheduleProposal().getProposedByUserId().equals(userId)) {
                return Future.failedFuture("Cannot respond to your own proposal");
            }

            JsonObject updates;
            if (accept) {
                updates = new JsonObject()
                    .put("scheduledStart", session.getRescheduleProposal().getNewScheduledStart())
                    .put("scheduledEnd", session.getRescheduleProposal().getNewScheduledEnd())
                    .putNull("rescheduleProposal");
            } else {
                updates = new JsonObject().putNull("rescheduleProposal");
            }

            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                emitSessionEvent(sessionId, accept ? "RESCHEDULE_ACCEPTED" : "RESCHEDULE_REJECTED", null);
            }).mapEmpty();
        });
    }

    public Future<Void> markPaid(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getStudentId())) {
                return Future.failedFuture("Only the student can mark as paid");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to mark as paid");
            }

            JsonObject updates = new JsonObject().put("studentMarkedPaid", true);
            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                emitSessionEvent(sessionId, "MARKED_PAID", null);
            }).mapEmpty();
        });
    }

    public Future<JsonObject> getPaymentInfo(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getStudentId())) {
                return Future.failedFuture("Only the student can request payment info");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to get payment info");
            }
            if (session.getSwapGroupId() != null && !session.getSwapGroupId().isEmpty()) {
                return Future.failedFuture("Swap sessions do not have payment info");
            }

            return profileRepository.findByUserId(session.getTeacherId()).compose(profile -> {
                if (profile == null || profile.getUpi() == null || profile.getUpi().trim().isEmpty()) {
                    return Future.failedFuture("Teacher does not have a UPI ID registered");
                }
                return Future.succeededFuture(new JsonObject().put("upiId", profile.getUpi()));
            });
        });
    }
}
