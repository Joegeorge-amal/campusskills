package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

public class RequireSuperAdminMiddleware {
    public static Handler<RoutingContext> create() {
        return ctx -> {
            String role = ctx.get("authenticatedUserRole");
            if ("SUPER_ADMIN".equals(role)) {
                ctx.next();
            } else {
                ctx.response().setStatusCode(403)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"Forbidden: Super Admin access required\"}");
            }
        };
    }
}
