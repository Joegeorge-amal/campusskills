package com.campusskills.web.middleware;

import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.core.json.JsonObject;
import com.campusskills.web.response.ApiResponse;
import com.campusskills.modules.users.repositories.UserRepository;

public class JwtAuthMiddleware {

    public static io.vertx.core.Handler<RoutingContext> create(JWTAuth jwtAuth) {
        UserRepository userRepository = new UserRepository();
        
        return ctx -> {
            String authHeader = ctx.request().getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ApiResponse.forbidden(ctx, "Missing or invalid Authorization header");
                return;
            }

            String token = authHeader.substring(7);
            
            jwtAuth.authenticate(new JsonObject().put("token", token))
                .onSuccess(user -> {
                    JsonObject principal = user.principal();
                    String userId = principal.getString("userId");
                    String role = principal.getString("role");
                    
                    if (userId == null) {
                        ApiResponse.forbidden(ctx, "Invalid token claims: missing userId");
                        return;
                    }
                    
                    // Verify user still exists in DB
                    userRepository.findById(userId)
                        .onSuccess(foundUser -> {
                            if (foundUser == null) {
                                ApiResponse.forbidden(ctx, "User no longer exists");
                                return;
                            }
                            
                            ctx.put("authenticatedUserId", userId);
                            if (role != null) {
                                ctx.put("authenticatedUserRole", role);
                            }
                            
                            ctx.next();
                        })
                        .onFailure(err -> {
                            ApiResponse.internalError(ctx, "Failed to verify user identity");
                        });
                })
                .onFailure(err -> {
                    ApiResponse.forbidden(ctx, "Invalid or expired token");
                });
        };
    }
}
