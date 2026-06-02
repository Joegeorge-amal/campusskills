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
            com.campusskills.modules.sessions.models.CreateSessionRequest req = body.mapTo(com.campusskills.modules.sessions.models.CreateSessionRequest.class);
            
            String authId = ctx.get("authenticatedUserId");
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }

            if (req.getRequestId() == null || req.getRequestId().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "requestId is required");
                return;
            }
            if (req.getMeetingPlatform() == null || req.getMeetingPlatform().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "meetingPlatform is required");
                return;
            }
            if (req.getMeetingLink() == null || req.getMeetingLink().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "meetingLink is required");
                return;
            }

            Long start = req.getScheduledAt() != null ? req.getScheduledAt() : req.getScheduledStart();
            if (start == null) {
                ApiResponse.badRequest(ctx, "scheduledAt (or scheduledStart) is required");
                return;
            }

            Long end = null;
            if (req.getDurationMinutes() != null && req.getDurationMinutes() > 0) {
                end = start + (req.getDurationMinutes() * 60 * 1000L);
            } else if (req.getScheduledEnd() != null) {
                end = req.getScheduledEnd();
            }

            if (end == null || end <= start) {
                ApiResponse.badRequest(ctx, "Valid durationMinutes (or scheduledEnd) is required");
                return;
            }

            Session session = new Session();
            session.setRequestId(req.getRequestId());
            session.setScheduledStart(start);
            session.setScheduledEnd(end);
            session.setMeetingPlatform(req.getMeetingPlatform());
            session.setMeetingLink(req.getMeetingLink());
            
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
            .onSuccess(msg -> ApiResponse.ok(ctx, new JsonObject().put("message", msg)))
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
