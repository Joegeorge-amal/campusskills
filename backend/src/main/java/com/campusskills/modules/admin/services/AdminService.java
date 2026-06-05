package com.campusskills.modules.admin.services;

import com.campusskills.modules.admin.repositories.AdminRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
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
        return adminRepository.updateDisputeStatus(sessionId, status, adminNotes);
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
