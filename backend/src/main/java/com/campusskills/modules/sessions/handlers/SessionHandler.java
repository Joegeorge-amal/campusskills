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
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }
            
            sessionService.createSession(session, authId)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Session created")))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getSessionsForAuthUser(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
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
            .onSuccess(result -> ApiResponse.paginatedOk(ctx, result.getJsonArray("items"), result.getInteger("page"), result.getInteger("limit"), result.getLong("total")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void getSessionById(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        sessionService.getSessionByIdAuth(sessionId, authId)
            .onSuccess(session -> ApiResponse.ok(ctx, JsonObject.mapFrom(session)))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void acceptSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.acceptSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session accepted")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void rejectSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.rejectSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session rejected")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void cancelSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.cancelSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session cancelled")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void completeSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.completeSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session marked as COMPLETED by teacher")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void confirmSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.confirmSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session confirmed by student")))
            .onFailure(err -> handleSessionFailure(ctx, err));
    }

    public void disputeSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        sessionService.disputeSession(sessionId, authId)
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
