package com.campusskills.modules.admin.handlers;

import com.campusskills.modules.admin.services.AdminService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.core.json.JsonObject;

public class AdminHandler {

    private final AdminService adminService;
    private final com.campusskills.modules.notifications.repositories.NotificationRepository notificationRepository;

    public AdminHandler(AdminService adminService, com.campusskills.modules.notifications.repositories.NotificationRepository notificationRepository) {
        this.adminService = adminService;
        this.notificationRepository = notificationRepository;
    }

    public void getUsers(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        String status = ctx.request().getParam("status");
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException ignored) {}

        adminService.searchUsers(q, status, page, limit)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch users: " + err.getMessage()));
    }

    public void getDisputes(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        String status = ctx.request().getParam("status");
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException ignored) {}

        adminService.searchDisputes(q, status, page, limit)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch disputes: " + err.getMessage()));
    }

    public void getSessions(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        String status = ctx.request().getParam("status");
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException ignored) {}

        adminService.searchSessions(q, status, page, limit)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch sessions: " + err.getMessage()));
    }

    public void updateUserStatus(RoutingContext ctx) {
        String id = ctx.request().getParam("id");
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("isActive")) {
            ApiResponse.badRequest(ctx, "Missing isActive in body");
            return;
        }
        boolean isActive = body.getBoolean("isActive");
        
        adminService.updateUserStatus(id, isActive)
            .onSuccess(updated -> {
                if (updated) {
                    ApiResponse.ok(ctx, new JsonObject().put("message", "User status updated"));
                } else {
                    ApiResponse.notFound(ctx, "User not found");
                }
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void updateUserRole(RoutingContext ctx) {
        String id = ctx.request().getParam("id");
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("role")) {
            ApiResponse.badRequest(ctx, "Missing role in body");
            return;
        }
        
        String roleStr = body.getString("role");
        com.campusskills.modules.users.models.UserRole role;
        try {
            role = com.campusskills.modules.users.models.UserRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            ApiResponse.badRequest(ctx, "Invalid role. Allowed: USER, EVALUATOR, ADMIN");
            return;
        }
        
        adminService.updateUserRole(id, role)
            .onSuccess(updated -> {
                if (updated) {
                    ApiResponse.ok(ctx, new JsonObject().put("message", "User role updated"));
                } else {
                    ApiResponse.notFound(ctx, "User not found");
                }
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }



    public void forceCompleteSession(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        JsonObject user = ctx.get("user");
        String adminId = user.getString("userId");

        adminService.forceCompleteSession(id, adminId)
            .onSuccess(success -> ApiResponse.ok(ctx, new JsonObject().put("success", success).put("message", "Session forcefully completed")))
            .onFailure(err -> {
                if (err.getMessage() != null && (err.getMessage().equals("Session not found") || err.getMessage().equals("Session is already fully confirmed"))) {
                    ApiResponse.badRequest(ctx, err.getMessage());
                } else {
                    ApiResponse.internalError(ctx, "Failed to force complete session");
                }
            });
    }

    public void getNotifications(RoutingContext ctx) {
        int page = 1;
        int limit = 20;
        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException ignored) {}

        int skip = (page - 1) * limit;

        io.vertx.core.CompositeFuture.all(
            notificationRepository.fetchAdminNotifications(skip, limit),
            notificationRepository.countUnreadAdminNotifications()
        ).onSuccess(res -> {
            java.util.List<com.campusskills.modules.notifications.models.Notification> notifs = res.resultAt(0);
            Long unreadCount = res.resultAt(1);
            
            io.vertx.core.json.JsonArray data = new io.vertx.core.json.JsonArray();
            if (notifs != null) {
                for (com.campusskills.modules.notifications.models.Notification n : notifs) {
                    data.add(io.vertx.core.json.JsonObject.mapFrom(n));
                }
            }
            
            ApiResponse.ok(ctx, new JsonObject()
                .put("notifications", data)
                .put("unreadCount", unreadCount != null ? unreadCount : 0)
            );
        }).onFailure(err -> {
            ApiResponse.internalError(ctx, "Failed to fetch admin notifications");
        });
    }

    public void markNotificationsRead(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        if (body != null && body.containsKey("id")) {
            String id = body.getString("id");
            notificationRepository.markAdminNotificationAsRead(id)
                .onSuccess(updated -> ApiResponse.ok(ctx, new JsonObject().put("success", updated)))
                .onFailure(err -> ApiResponse.internalError(ctx, "Failed to mark read"));
        } else {
            notificationRepository.markAllAdminNotificationsAsRead()
                .onSuccess(count -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("count", count)))
                .onFailure(err -> ApiResponse.internalError(ctx, "Failed to mark all read"));
        }
    }

    public void updateDisputeStatus(RoutingContext ctx) {
        String id = ctx.request().getParam("id");
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("status")) {
            ApiResponse.badRequest(ctx, "Missing status in body");
            return;
        }
        String status = body.getString("status");
        String adminNotes = body.getString("adminNotes");
        
        adminService.updateDisputeStatus(id, status, adminNotes)
            .onSuccess(updated -> {
                if (updated) {
                    ApiResponse.ok(ctx, new JsonObject().put("message", "Dispute status updated"));
                } else {
                    ApiResponse.notFound(ctx, "Dispute not found");
                }
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void cancelSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("id");

        adminService.cancelSession(sessionId)
            .onSuccess(success -> {
                if (success) {
                    ctx.response().setStatusCode(200).end(new JsonObject().put("message", "Session cancelled successfully").encode());
                } else {
                    ctx.response().setStatusCode(404).end(new JsonObject().put("error", "Session not found").encode());
                }
            })
            .onFailure(err -> {
                ctx.response().setStatusCode(500).end(new JsonObject().put("error", "Internal server error").encode());
            });
    }

    public void getListings(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        String status = ctx.request().getParam("status");
        int page = 1;
        int limit = 20;

        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException e) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Invalid pagination parameters").encode());
            return;
        }

        adminService.searchListings(q, status, page, limit)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch listings: " + err.getMessage()));
    }

    public void updateListingStatus(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        JsonObject body;
        try {
            body = ctx.getBodyAsJson();
        } catch (Exception e) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Invalid JSON payload").encode());
            return;
        }

        String status = body.getString("status");
        if (status == null || (!status.equals("ACTIVE") && !status.equals("ADMIN_DISABLED"))) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Invalid status. Must be ACTIVE or ADMIN_DISABLED").encode());
            return;
        }

        adminService.updateListingStatus(id, status)
            .onSuccess(success -> {
                if (success) {
                    ApiResponse.ok(ctx, new JsonObject().put("message", "Listing status updated to " + status));
                } else {
                    ApiResponse.notFound(ctx, "Listing not found");
                }
            })
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to update listing: " + err.getMessage()));
    }

    public void getOverviewData(RoutingContext ctx) {
        adminService.getOverviewData()
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch overview: " + err.getMessage()));
    }

    public void getAnalyticsData(RoutingContext ctx) {
        String yearParam = ctx.request().getParam("year");
        String department = ctx.request().getParam("department");
        String month = ctx.request().getParam("month");

        Integer year = null;
        if (yearParam != null) {
            try {
                year = Integer.parseInt(yearParam);
            } catch (NumberFormatException e) {
                // Ignore invalid year, will use current year
            }
        }

        adminService.getAnalyticsData(year, department, month)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch analytics: " + err.getMessage()));
    }

    public void getSettings(RoutingContext ctx) {
        adminService.getSettings()
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch settings: " + err.getMessage()));
    }

    public void updateSettings(RoutingContext ctx) {
        JsonObject body;
        try {
            body = ctx.getBodyAsJson();
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON payload");
            return;
        }

        JsonObject user = ctx.get("user");
        String updatedBy = user != null ? user.getString("id") : "system";

        adminService.updateSettings(body, updatedBy)
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to update settings: " + err.getMessage()));
    }
}
