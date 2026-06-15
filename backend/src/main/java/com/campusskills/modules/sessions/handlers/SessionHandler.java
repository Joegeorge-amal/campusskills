package com.campusskills.modules.sessions.handlers;

import com.campusskills.modules.sessions.services.SessionService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class SessionHandler {

    private final SessionService sessionService;

    public SessionHandler(io.vertx.core.eventbus.EventBus eventBus) {
        this.sessionService = new SessionService(eventBus);
    }

    public void getSessionsForAuthUser(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.queryParam("page") != null && !ctx.queryParam("page").isEmpty()) {
                page = Integer.parseInt(ctx.queryParam("page").get(0));
            }
            if (ctx.queryParam("limit") != null && !ctx.queryParam("limit").isEmpty()) {
                limit = Integer.parseInt(ctx.queryParam("limit").get(0));
            }
        } catch (NumberFormatException e) {
            ApiResponse.badRequest(ctx, "Invalid pagination parameters");
            return;
        }
        
        sessionService.getUserSessions(authId, page, limit)
            .onSuccess(result -> ApiResponse.ok(ctx, result))
            .onFailure(err -> ApiResponse.internalError(ctx, "Failed to get sessions: " + err.getMessage()));
    }

    public void getSessionById(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");

        sessionService.getSessionByIdAuth(sessionId, authId)
            .onSuccess(session -> ApiResponse.ok(ctx, JsonObject.mapFrom(session)))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void markCompletion(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        
        sessionService.markCompletion(sessionId, authId)
            .onSuccess(msg -> ApiResponse.ok(ctx, new JsonObject().put("message", "Completion marked")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void proposeReschedule(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        
        JsonObject body = ctx.body().asJsonObject();
        Long newStart = body.getLong("newStart");
        Long newEnd = body.getLong("newEnd");

        if (newStart == null || newEnd == null) {
            ApiResponse.badRequest(ctx, "newStart and newEnd are required");
            return;
        }

        sessionService.proposeReschedule(sessionId, authId, newStart, newEnd)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Reschedule proposed")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void respondToReschedule(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        
        JsonObject body = ctx.body().asJsonObject();
        Boolean accept = body.getBoolean("accept");

        if (accept == null) {
            ApiResponse.badRequest(ctx, "accept boolean is required");
            return;
        }

        sessionService.respondToReschedule(sessionId, authId, accept)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", accept ? "Reschedule accepted" : "Reschedule rejected")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void markPaid(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        
        sessionService.markPaid(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session marked as paid")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void getPaymentInfo(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        
        sessionService.getPaymentInfo(sessionId, authId)
            .onSuccess(info -> ApiResponse.ok(ctx, info))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }
}
