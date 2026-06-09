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
        return adminRepository.cancelSession(sessionId);
    }

    public Future<JsonObject> searchListings(String q, String status, int page, int limit) {
        return adminRepository.searchListings(q, status, page, limit);
    }

    public Future<Boolean> updateListingStatus(String id, String status) {
        return adminRepository.updateListingStatus(id, status);
    }
}
