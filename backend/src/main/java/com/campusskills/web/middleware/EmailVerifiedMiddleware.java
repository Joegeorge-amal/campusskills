package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import com.campusskills.web.response.ApiResponse;

public class EmailVerifiedMiddleware {
    
    public static Handler<RoutingContext> create() {
        return ctx -> {
            com.campusskills.modules.users.models.User user = ctx.get("user");
            if (user == null) {
                ApiResponse.sendError(ctx, 401, "Unauthorized");
                return;
            }

            Boolean emailVerified = user.getEmailVerified();
            
            // Allow SUPER_ADMIN to bypass, just in case they don't have it set correctly
            com.campusskills.modules.users.models.UserRole role = user.getRole();
            if (role != null && "SUPER_ADMIN".equals(role.name())) {
                ctx.next();
                return;
            }

            if (emailVerified == null || !emailVerified) {
                ApiResponse.sendError(ctx, 403, "Email verification required to access this feature.");
                return;
            }

            ctx.next();
        };
    }
}
