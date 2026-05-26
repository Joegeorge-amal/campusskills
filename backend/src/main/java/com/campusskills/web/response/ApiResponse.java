package com.campusskills.web.response;

import io.vertx.core.json.JsonObject;
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
        JsonObject response = new JsonObject()
                .put("success", true)
                .put("data", data);
        
        ctx.response()
                .setStatusCode(statusCode)
                .putHeader("content-type", "application/json")
                .end(response.encode());
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

    public static void created(RoutingContext ctx, Object data) {
        sendSuccess(ctx, 201, data);
    }

    public static void badRequest(RoutingContext ctx, String message) {
        sendError(ctx, 400, message);
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
