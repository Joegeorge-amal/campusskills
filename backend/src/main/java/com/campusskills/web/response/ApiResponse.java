package com.campusskills.web.response;

import io.vertx.core.json.JsonObject;
import io.vertx.core.json.Json;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ApiResponse {

    private static final Logger log = LoggerFactory.getLogger(ApiResponse.class);

    private static String getRequestId(RoutingContext ctx) {
        String reqId = ctx.get("requestId");
        return reqId != null ? reqId : "UNKNOWN";
    }

    private static void sendSuccess(RoutingContext ctx, int statusCode, Object data) {
        try {
            Object normalizedData = data == null ? null : Json.decodeValue(Json.encode(data));
            JsonObject response = new JsonObject()
                    .put("success", true)
                    .put("data", normalizedData);
            
            ctx.response()
                    .setStatusCode(statusCode)
                    .putHeader("content-type", "application/json")
                    .end(response.encode());
        } catch (Exception e) {
            log.error("[{}] Failed to serialize success response for {}", getRequestId(ctx), ctx.request().path(), e);
            ctx.fail(e);
        }
    }

    public static void sendError(RoutingContext ctx, int statusCode, String message) {
        String requestId = getRequestId(ctx);
        JsonObject response = new JsonObject()
                .put("success", false)
                .put("error", message)
                .put("requestId", requestId);
        
        if (statusCode >= 500) {
            log.error("[{}] Internal Server Error: {}", requestId, message);
        } else {
            log.warn("[{}] Client Error ({}): {}", requestId, statusCode, message);
        }

        ctx.response()
                .setStatusCode(statusCode)
                .putHeader("content-type", "application/json")
                .end(response.encode());
    }

    public static void ok(RoutingContext ctx, Object data) {
        sendSuccess(ctx, 200, data);
    }

    public static void paginatedOk(RoutingContext ctx, Object items, int page, int limit, long total) {
        JsonObject data = new JsonObject()
                .put("items", items)
                .put("page", page)
                .put("limit", limit)
                .put("total", total)
                .put("hasMore", (page * limit) < total);
        sendSuccess(ctx, 200, data);
    }

    public static void created(RoutingContext ctx, Object data) {
        sendSuccess(ctx, 201, data);
    }

    public static void badRequest(RoutingContext ctx, String message) {
        sendError(ctx, 400, message);
    }

    public static void unauthorized(RoutingContext ctx, String message) {
        sendError(ctx, 401, message);
    }

    public static void forbidden(RoutingContext ctx, String message) {
        sendError(ctx, 403, message);
    }

    public static void notFound(RoutingContext ctx, String message) {
        sendError(ctx, 404, message);
    }

    public static void conflict(RoutingContext ctx, String message) {
        sendError(ctx, 409, message);
    }

    public static void internalError(RoutingContext ctx, String message) {
        sendError(ctx, 500, message);
    }
}
