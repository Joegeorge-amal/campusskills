package com.campusskills.modules.notifications.handlers;

import com.campusskills.modules.notifications.services.NotificationService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class NotificationHandler {
    private final NotificationService notificationService;

    public NotificationHandler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void getNotifications(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        int skip = 0;
        int limit = 20; // Default limit
        try {
            if (ctx.queryParam("skip") != null && !ctx.queryParam("skip").isEmpty()) {
                skip = Integer.parseInt(ctx.queryParam("skip").get(0));
            }
            if (ctx.queryParam("limit") != null && !ctx.queryParam("limit").isEmpty()) {
                limit = Integer.parseInt(ctx.queryParam("limit").get(0));
            }
        } catch (NumberFormatException ignored) {}

        notificationService.getUserNotifications(authId, skip, limit)
            .onSuccess(notifications -> {
                JsonObject data = new JsonObject().put("notifications", notifications);
                ApiResponse.ok(ctx, data);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch notifications: " + err.getMessage()));
    }

    public void getUnreadNotifications(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        int skip = 0;
        int limit = 20; // Default limit
        try {
            if (ctx.queryParam("skip") != null && !ctx.queryParam("skip").isEmpty()) {
                skip = Integer.parseInt(ctx.queryParam("skip").get(0));
            }
            if (ctx.queryParam("limit") != null && !ctx.queryParam("limit").isEmpty()) {
                limit = Integer.parseInt(ctx.queryParam("limit").get(0));
            }
        } catch (NumberFormatException ignored) {}

        notificationService.getUnreadNotifications(authId, skip, limit)
            .onSuccess(notifications -> {
                JsonObject data = new JsonObject().put("notifications", notifications);
                ApiResponse.ok(ctx, data);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to fetch unread notifications: " + err.getMessage()));
    }

    public void markAsRead(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        String notificationId = ctx.pathParam("id");
        if (notificationId == null || notificationId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "Notification ID is required");
            return;
        }

        notificationService.markAsRead(notificationId, authId)
            .onSuccess(updatedNotification -> {
                JsonObject data = new JsonObject().put("notification", JsonObject.mapFrom(updatedNotification));
                ApiResponse.ok(ctx, data);
            })
            .onFailure(err -> {
                if ("NOTIFICATION_NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Notification not found or unauthorized");
                } else {
                    ApiResponse.internalError(ctx, "Failed to mark notification as read: " + err.getMessage());
                }
            });
    }

    public void markAllAsRead(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        notificationService.markAllAsRead(authId)
            .onSuccess(count -> {
                JsonObject data = new JsonObject()
                    .put("message", "All notifications marked as read")
                    .put("updatedCount", count);
                ApiResponse.ok(ctx, data);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to mark all notifications as read: " + err.getMessage()));
    }

    public void deleteNotification(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        String notificationId = ctx.pathParam("id");
        if (notificationId == null || notificationId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "Notification ID is required");
            return;
        }

        notificationService.deleteNotification(notificationId, authId)
            .onSuccess(v -> {
                ApiResponse.ok(ctx, new JsonObject().put("message", "Notification deleted"));
            })
            .onFailure(err -> {
                if ("NOTIFICATION_NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Notification not found or unauthorized");
                } else {
                    ApiResponse.internalError(ctx, "Failed to delete notification: " + err.getMessage());
                }
            });
    }
}
