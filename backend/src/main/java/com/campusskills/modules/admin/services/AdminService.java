package com.campusskills.modules.admin.services;

import com.campusskills.modules.admin.repositories.AdminRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import java.util.List;

public class AdminService {

    private final AdminRepository adminRepository;
    private final com.campusskills.modules.sessions.repositories.SessionRepository sessionRepository;
    private final com.campusskills.modules.users.repositories.UserRepository userRepository;
    private final com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository;
    private final io.vertx.core.eventbus.EventBus eventBus;

    public AdminService(AdminRepository adminRepository, 
                        com.campusskills.modules.sessions.repositories.SessionRepository sessionRepository, 
                        com.campusskills.modules.users.repositories.UserRepository userRepository, 
                        com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository,
                        io.vertx.core.eventbus.EventBus eventBus) {
        this.adminRepository = adminRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventBus = eventBus;
    }

    public Future<Boolean> updateUserRole(String userId, com.campusskills.modules.users.models.UserRole role) {
        if (userId == null || userId.trim().isEmpty() || role == null) {
            return Future.failedFuture("User ID and Role are required");
        }
        
        // Do not allow API to assign SUPER_ADMIN role
        if (role == com.campusskills.modules.users.models.UserRole.SUPER_ADMIN) {
            return Future.failedFuture("Cannot assign SUPER_ADMIN role via API");
        }
        
        return userRepository.findById(userId).compose(user -> {
            if (user == null) {
                return Future.succeededFuture(false);
            }
            // Prevent demoting configured SUPER_ADMIN_EMAILS
            if (com.campusskills.modules.users.services.UserService.isSuperAdmin(user.getEmail())) {
                return Future.failedFuture("Cannot modify role of configured SUPER_ADMIN_EMAILS");
            }
            
            return userRepository.updateUserRole(userId, role);
        });
    }



    private void sendNotification(String userId, com.campusskills.shared.constants.NotificationType type, String title, String message, String sourceType, String sourceId) {
        if (eventBus == null || userId == null) return;
        JsonObject payload = new JsonObject()
            .put("userId", userId)
            .put("type", type.name())
            .put("title", title)
            .put("message", message)
            .put("sourceType", sourceType)
            .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", payload);
    }

    public Future<JsonObject> searchUsers(String q, String status, int page, int limit) {
        return adminRepository.searchUsers(q, status, page, limit);
    }

    public Future<JsonObject> searchDisputes(String q, String status, int page, int limit) {
        return adminRepository.searchDisputes(q, status, page, limit);
    }

    public Future<JsonObject> searchSessions(String q, String status, int page, int limit) {
        return adminRepository.searchSessions(q, status, page, limit);
    }

    public Future<Boolean> updateUserStatus(String userId, boolean isActive) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("User ID is required");
        }
        return adminRepository.updateUserStatus(userId, isActive);
    }

    public Future<Boolean> updateDisputeStatus(String sessionId, String status, String adminNotes) {
        if (sessionId == null || sessionId.trim().isEmpty() || status == null || status.trim().isEmpty()) {
            return Future.failedFuture("Session ID and status are required");
        }
        return adminRepository.updateDisputeStatus(sessionId, status, adminNotes).compose(success -> {
            if (success) {
                return sessionRepository.getSessionById(sessionId).compose(session -> {
                    if (session != null) {
                        sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.DISPUTE_UPDATED, "Dispute Updated", "The dispute status for your session has been updated to: " + status, "SESSION", sessionId);
                        sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.DISPUTE_UPDATED, "Dispute Updated", "The dispute status for your session has been updated to: " + status, "SESSION", sessionId);
                        
                        if ("RESOLVED".equalsIgnoreCase(status)) {
                            JsonObject adminNotif = new JsonObject()
                                .put("recipientType", "ADMIN")
                                .put("type", "ADMIN_DISPUTE_RESOLVED")
                                .put("title", "Dispute resolved")
                                .put("message", "Dispute for session " + sessionId + " was resolved.")
                                .put("sourceType", "SESSION")
                                .put("sourceId", sessionId);
                            eventBus.send("internal.notification.create", adminNotif);
                        }
                    }
                    return Future.succeededFuture(true);
                });
            }
            return Future.succeededFuture(false);
        });
    }

    public Future<Boolean> cancelSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("Session ID is required");
        }
        return adminRepository.cancelSession(sessionId).compose(cancelled -> {
            if (cancelled) {
                // Fetch the session to notify users
                return new com.campusskills.modules.sessions.repositories.SessionRepository().getSessionById(sessionId).onSuccess(session -> {
                    if (session != null && eventBus != null) {
                        JsonObject notifTeacher = new JsonObject()
                            .put("userId", session.getTeacherId())
                            .put("type", "SESSION_CANCELLED")
                            .put("title", "Session Cancelled")
                            .put("message", "Your session has been cancelled by an admin.")
                            .put("sourceType", "SESSION")
                            .put("sourceId", sessionId);
                        eventBus.send("internal.notification.create", notifTeacher);
                        
                        if (!session.getTeacherId().equals(session.getStudentId())) {
                            JsonObject notifStudent = new JsonObject()
                                .put("userId", session.getStudentId())
                                .put("type", "SESSION_CANCELLED")
                                .put("title", "Session Cancelled")
                                .put("message", "Your session has been cancelled by an admin.")
                                .put("sourceType", "SESSION")
                                .put("sourceId", sessionId);
                            eventBus.send("internal.notification.create", notifStudent);
                        }
                    }
                }).map(session -> true);
            }
            return Future.succeededFuture(false);
        });
    }

    public Future<JsonObject> searchListings(String q, String status, int page, int limit) {
        return adminRepository.searchListings(q, status, page, limit);
    }

    public Future<Boolean> updateListingStatus(String id, String status) {
        return adminRepository.updateListingStatus(id, status);
    }

    public Future<Boolean> forceCompleteSession(String sessionId, String adminId) {
        return sessionRepository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("Session not found");
            }
            java.util.Set<String> confirmedBy = session.getConfirmedBy() == null ? new java.util.HashSet<>() : session.getConfirmedBy();
            String missingUserId = null;
            
            if (!confirmedBy.contains(session.getStudentId())) {
                missingUserId = session.getStudentId();
            } else if (!confirmedBy.contains(session.getTeacherId())) {
                missingUserId = session.getTeacherId();
            }
            
            if (missingUserId == null) {
                return Future.failedFuture("Session is already fully confirmed");
            }

            final String missingId = missingUserId;
            return sessionRepository.addConfirmation(sessionId, missingId).compose(v -> {
                JsonObject update = new JsonObject().put("status", com.campusskills.shared.constants.SessionStatus.COMPLETED.name());
                return sessionRepository.updateSessionFields(sessionId, update).compose(v2 -> {
                    
                    // Emit notifications
                    sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.ADMIN_DISPUTE_RESOLVED, "Dispute Resolved", "Admin has forced completed the session.", "SESSION", sessionId);
                    sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.ADMIN_DISPUTE_RESOLVED, "Dispute Resolved", "Admin has forced completed the session.", "SESSION", sessionId);
                    
                    sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been marked as completed.", "SESSION", sessionId);
                    sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", "The session has been marked as completed.", "SESSION", sessionId);
                    
                    return Future.succeededFuture(true);
                });
            });
        });
    }

    public Future<JsonObject> getOverviewData() {
        Future<JsonObject> statsFuture = adminRepository.getOverviewStats()
            .recover(err -> Future.succeededFuture(new JsonObject()
                .put("totalStudents", new JsonObject().put("value", 0).put("trend", "Error").put("isPositive", false))
                .put("activeSessions", new JsonObject().put("value", 0).put("trend", "Error").put("isPositive", false))
                .put("openDisputes", new JsonObject().put("value", 0).put("trend", "Error").put("isPositive", false))
                .put("revenue", new JsonObject().put("value", 0).put("trend", "Error").put("isPositive", false))));
                
        Future<io.vertx.core.json.JsonArray> recentRegsFuture = adminRepository.getRecentRegistrations()
            .recover(err -> Future.succeededFuture(new io.vertx.core.json.JsonArray()));
            
        Future<io.vertx.core.json.JsonArray> pendingDispsFuture = adminRepository.getPendingDisputes()
            .recover(err -> Future.succeededFuture(new io.vertx.core.json.JsonArray()));
            
        Future<JsonObject> catPerfFuture = adminRepository.getCategoryPerformance()
            .recover(err -> Future.succeededFuture(new JsonObject()
                .put("totalSessions", 0)
                .put("activeTutors", 0)
                .put("avgRating", 0.0)
                .put("categories", new io.vertx.core.json.JsonArray())));
                
        Future<io.vertx.core.json.JsonArray> topTutorsFuture = adminRepository.getTopTutors()
            .recover(err -> Future.succeededFuture(new io.vertx.core.json.JsonArray()));
            
        Future<io.vertx.core.json.JsonArray> liveActivityFuture = adminRepository.getLiveActivity()
            .recover(err -> Future.succeededFuture(new io.vertx.core.json.JsonArray()));
            
        Future<JsonObject> healthMetricsFuture = adminRepository.getPlatformHealthMetrics()
            .recover(err -> Future.succeededFuture(new JsonObject()
                .put("sessionCompletionRate", 0L)
                .put("disputeRate", 0L)
                .put("positiveRatingRate", 0L)));
            
        return io.vertx.core.CompositeFuture.all(java.util.Arrays.asList(statsFuture, recentRegsFuture, pendingDispsFuture, catPerfFuture, topTutorsFuture, liveActivityFuture, healthMetricsFuture))
            .map(cf -> {
                JsonObject health = (JsonObject) cf.resultAt(6);
                return new JsonObject()
                    .put("platformOverview", (JsonObject) cf.resultAt(0))
                    .put("recentRegistrations", (io.vertx.core.json.JsonArray) cf.resultAt(1))
                    .put("pendingDisputes", (io.vertx.core.json.JsonArray) cf.resultAt(2))
                    .put("categoryPerformance", (JsonObject) cf.resultAt(3))
                    .put("topTutors", (io.vertx.core.json.JsonArray) cf.resultAt(4))
                    .put("liveActivity", (io.vertx.core.json.JsonArray) cf.resultAt(5))
                    .put("platformHealth", new JsonObject()
                        .put("status", "All systems operational")
                        .put("uptime", "99.9%")
                        .put("avgLoad", "142ms")
                        .put("metrics", new io.vertx.core.json.JsonArray()
                            .add(new JsonObject().put("label", "Session Completion Rate").put("value", health.getLong("sessionCompletionRate", 0L) + "%").put("fill", health.getLong("sessionCompletionRate", 0L)).put("color", "#3b82f6"))
                            .add(new JsonObject().put("label", "Dispute Rate").put("value", health.getLong("disputeRate", 0L) + "%").put("fill", health.getLong("disputeRate", 0L)).put("color", "#ef4444"))
                            .add(new JsonObject().put("label", "Positive Rating Rate").put("value", health.getLong("positiveRatingRate", 0L) + "%").put("fill", health.getLong("positiveRatingRate", 0L)).put("color", "#10b981"))
                        )
                    );
            });
    }
}
