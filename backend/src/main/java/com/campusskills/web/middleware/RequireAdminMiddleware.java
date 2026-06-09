package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

public class RequireAdminMiddleware {
    public static Handler<RoutingContext> create() {
        return ctx -> {
            String role = ctx.get("authenticatedUserRole");
            if ("ADMIN".equals(role) || "SUPER_ADMIN".equals(role)) {
                ctx.next();
            } else {
                ctx.response().setStatusCode(403).putHeader("content-type", "application/json").end("{\"error\": \"Forbidden: Admin access required\"}");
            }
        };
    }
}
