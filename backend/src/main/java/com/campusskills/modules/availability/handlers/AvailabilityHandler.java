package com.campusskills.modules.availability.handlers;

import com.campusskills.modules.availability.models.AvailabilityException;
import com.campusskills.modules.availability.models.AvailabilitySlot;
import com.campusskills.modules.availability.services.AvailabilityService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.List;
import java.util.stream.Collectors;

public class AvailabilityHandler {

    private final AvailabilityService service;

    public AvailabilityHandler() {
        this.service = new AvailabilityService();
    }

    public void getUserAvailability(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        if (userId == null || userId.isEmpty()) {
            ApiResponse.badRequest(ctx, "User ID is required");
            return;
        }

        service.getUserAvailability(userId).onComplete(ar -> {
            if (ar.succeeded()) {
                ApiResponse.ok(ctx, ar.result());
            } else {
                ApiResponse.internalError(ctx, "Failed to fetch availability: " + ar.cause().getMessage());
            }
        });
    }

    public void updateMySlots(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        JsonArray body = ctx.body().asJsonArray();
        
        if (body == null) {
            ApiResponse.badRequest(ctx, "Invalid payload");
            return;
        }

        List<AvailabilitySlot> newSlots = body.stream()
                .map(obj -> ((JsonObject) obj).mapTo(AvailabilitySlot.class))
                .collect(Collectors.toList());

        service.updateUserSlots(userId, newSlots).onComplete(ar -> {
            if (ar.succeeded()) {
                ApiResponse.ok(ctx, new JsonObject().put("message", "Availability updated"));
            } else {
                ApiResponse.internalError(ctx, "Failed to update slots: " + ar.cause().getMessage());
            }
        });
    }

    public void addMyException(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        AvailabilityException exception;
        try {
            exception = ctx.body().asJsonObject().mapTo(AvailabilityException.class);
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid payload");
            return;
        }

        service.addException(userId, exception).onComplete(ar -> {
            if (ar.succeeded()) {
                ApiResponse.created(ctx, new JsonObject().put("id", ar.result()));
            } else {
                ApiResponse.internalError(ctx, "Failed to add exception: " + ar.cause().getMessage());
            }
        });
    }

    public void deleteMyException(RoutingContext ctx) {
        String exceptionId = ctx.pathParam("exceptionId");
        if (exceptionId == null || exceptionId.isEmpty()) {
            ApiResponse.badRequest(ctx, "Exception ID is required");
            return;
        }

        service.deleteException(exceptionId).onComplete(ar -> {
            if (ar.succeeded()) {
                ApiResponse.ok(ctx, new JsonObject().put("message", "Exception deleted"));
            } else {
                ApiResponse.internalError(ctx, "Failed to delete exception: " + ar.cause().getMessage());
            }
        });
    }
}
