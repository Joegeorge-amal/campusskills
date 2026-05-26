package com.campusskills.modules.sessions.handlers;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.services.SessionService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import com.campusskills.web.response.ApiResponse;

public class SessionHandler {

    private final SessionService sessionService;

    public SessionHandler(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    public void createSession(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            Session session = body.mapTo(Session.class);
            String authId = ctx.get("authenticatedUserId");
            String requesterId = authId != null ? authId : body.getString("requesterId");
            
            sessionService.createSession(session, requesterId)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Session created")))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getUserSessions(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        sessionService.getUserSessions(userId)
            .onSuccess(sessions -> {
                JsonArray responseArray = new JsonArray();
                sessions.forEach(sess -> responseArray.add(JsonObject.mapFrom(sess)));
                ApiResponse.ok(ctx, responseArray);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void acceptSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.acceptSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session accepted")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void rejectSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.rejectSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session rejected")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void cancelSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.cancelSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session cancelled")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void completeSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.completeSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session marked as COMPLETED by teacher")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void confirmSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.confirmSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session confirmed by student")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void disputeSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        JsonObject body = ctx.body().asJsonObject();
        String authId = ctx.get("authenticatedUserId");
        String requesterId = authId != null ? authId : (body != null ? body.getString("requesterId") : null);
        
        sessionService.disputeSession(sessionId, requesterId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session DISPUTED")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    private void handleSessionFailure(RoutingContext ctx, Throwable err) {
        if (err.getMessage() != null && err.getMessage().startsWith("UNAUTHORIZED")) {
            ApiResponse.forbidden(ctx, err.getMessage());
        } else if ("SESSION_NOT_FOUND".equals(err.getMessage())) {
            ApiResponse.notFound(ctx, "Session not found");
        } else {
            ApiResponse.badRequest(ctx, err.getMessage());
        }
    }
}
