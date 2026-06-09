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
        String authId = ctx.user().principal().getString("sub");
        
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
        String authId = ctx.user().principal().getString("sub");

        sessionService.getSessionByIdAuth(sessionId, authId)
            .onSuccess(session -> ApiResponse.ok(ctx, JsonObject.mapFrom(session)))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void confirmSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.user().principal().getString("sub");
        
        sessionService.confirmSession(sessionId, authId)
            .onSuccess(msg -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session confirmed")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void disputeSession(RoutingContext ctx) {
        String sessionId = ctx.pathParam("sessionId");
        String authId = ctx.user().principal().getString("sub");
        
        sessionService.disputeSession(sessionId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Session DISPUTED")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }
}
