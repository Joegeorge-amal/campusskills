package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

public class RequireAdminMiddleware {
    public static Handler<RoutingContext> create() {
        return ctx -> {
            String role = ctx.get("authenticatedUserRole");
            if ("ADMIN".equals(role) || "SUPER_ADMIN".equals(role)) {
                Boolean twoFactorVerified = ctx.get("twoFactorVerified");
                if (twoFactorVerified == null || !twoFactorVerified) {
                    ctx.response().setStatusCode(403).putHeader("content-type", "application/json").end("{\"error\": \"Forbidden: Two-factor authentication required\"}");
                    return;
                }
                ctx.next();
            } else {
                ctx.response().setStatusCode(403).putHeader("content-type", "application/json").end("{\"error\": \"Forbidden: Admin access required\"}");
            }
        };
    }
}
