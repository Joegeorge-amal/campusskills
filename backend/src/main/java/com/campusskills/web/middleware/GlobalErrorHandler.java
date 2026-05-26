package com.campusskills.web.middleware;

import com.campusskills.web.response.ApiResponse;
import io.vertx.core.Handler;
import io.vertx.core.json.DecodeException;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GlobalErrorHandler implements Handler<RoutingContext> {

    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

    public static GlobalErrorHandler create() {
        return new GlobalErrorHandler();
    }

    @Override
    public void handle(RoutingContext ctx) {
        Throwable failure = ctx.failure();
        String requestId = ctx.get("requestId");
        if (requestId == null) requestId = "UNKNOWN";

        if (failure != null) {
            if (failure instanceof DecodeException) {
                ApiResponse.badRequest(ctx, "Invalid JSON format");
            } else {
                log.error("[{}] Unhandled exception in route: {}", requestId, ctx.request().path(), failure);
                ApiResponse.internalError(ctx, "An unexpected server error occurred");
            }
        } else {
            int statusCode = ctx.statusCode();
            if (statusCode == -1) statusCode = 500;
            
            if (statusCode == 404) {
                ApiResponse.notFound(ctx, "Endpoint not found");
            } else {
                ApiResponse.sendError(ctx, statusCode, "HTTP Error " + statusCode);
            }
        }
    }
}
