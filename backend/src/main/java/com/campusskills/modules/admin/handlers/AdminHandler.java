package com.campusskills.modules.admin.handlers;

import com.campusskills.modules.admin.services.AdminService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.core.json.JsonObject;

public class AdminHandler {

    private final AdminService adminService;

    public AdminHandler(AdminService adminService) {
        this.adminService = adminService;
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
                    ApiResponse.ok(ctx, new JsonObject().put("message", "User role updated to " + role.name()));
                } else {
                    ApiResponse.notFound(ctx, "User not found");
                }
            })
            .onFailure(err -> {
                if (err.getMessage().startsWith("Cannot")) {
                    ApiResponse.sendError(ctx, 403, err.getMessage());
                } else {
                    ApiResponse.internalError(ctx, err.getMessage());
                }
            });
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
            .onSuccess(result -> ctx.response().setStatusCode(200).end(result.encode()))
            .onFailure(err -> {
                System.err.println("Failed to fetch listings: " + err.getMessage());
                ctx.response().setStatusCode(500).end(new JsonObject().put("error", "Internal server error").encode());
            });
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
                    ctx.response().setStatusCode(200).end(new JsonObject().put("message", "Listing status updated to " + status).encode());
                } else {
                    ctx.response().setStatusCode(404).end(new JsonObject().put("error", "Listing not found").encode());
                }
            })
            .onFailure(err -> {
                ctx.response().setStatusCode(500).end(new JsonObject().put("error", "Internal server error").encode());
            });
    }


}
