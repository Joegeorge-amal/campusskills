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
                ApiResponse.unauthorized(ctx, "Missing or invalid Authorization header");
                return;
            }

            String token = authHeader.substring(7);
            
            jwtAuth.authenticate(new JsonObject().put("token", token))
                .onSuccess(user -> {
                    JsonObject principal = user.principal();
                    String userId = principal.getString("userId");
                    String role = principal.getString("role");
                    
                    if (userId == null) {
                        ApiResponse.unauthorized(ctx, "Invalid token claims: missing userId");
                        return;
                    }
                    
                    // Verify user still exists in DB
                    userRepository.findById(userId)
                        .onSuccess(foundUser -> {
                            if (foundUser == null) {
                                ApiResponse.unauthorized(ctx, "User no longer exists");
                                return;
                            }
                            
                            if (foundUser.getIsActive() != null && !foundUser.getIsActive()) {
                                ctx.response().setStatusCode(403).putHeader("content-type", "application/json").end(new JsonObject().put("error", "Your account has been suspended").encode());
                                return;
                            }
                            
                            ctx.put("authenticatedUserId", userId);
                            if (role != null) {
                                ctx.put("authenticatedUserRole", role);
                            }
                            if (principal.containsKey("twoFactorVerified")) {
                                ctx.put("twoFactorVerified", principal.getBoolean("twoFactorVerified"));
                            }
                            ctx.put("user", foundUser);
                            
                            ctx.next();
                        })
                        .onFailure(err -> {
                            ApiResponse.internalError(ctx, "Failed to verify user identity");
                        });
                })
                .onFailure(err -> {
                    ApiResponse.unauthorized(ctx, "Invalid or expired token");
                });
        };
    }

    public static io.vertx.core.Handler<RoutingContext> createOptional(JWTAuth jwtAuth) {
        UserRepository userRepository = new UserRepository();
        return ctx -> {
            String authHeader = ctx.request().getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ctx.next();
                return;
            }

            String token = authHeader.substring(7);
            
            jwtAuth.authenticate(new JsonObject().put("token", token))
                .onSuccess(user -> {
                    JsonObject principal = user.principal();
                    String userId = principal.getString("userId");
                    String role = principal.getString("role");
                    
                    if (userId == null) {
                        ctx.next();
                        return;
                    }
                    
                    userRepository.findById(userId)
                        .onSuccess(foundUser -> {
                            if (foundUser != null) {
                                if (foundUser.getIsActive() != null && !foundUser.getIsActive()) {
                                    // User is suspended, treat as unauthenticated for optional endpoints
                                } else {
                                    ctx.put("authenticatedUserId", userId);
                                    if (role != null) {
                                        ctx.put("authenticatedUserRole", role);
                                    }
                                    if (principal.containsKey("twoFactorVerified")) {
                                        ctx.put("twoFactorVerified", principal.getBoolean("twoFactorVerified"));
                                    }
                                    ctx.put("user", foundUser);
                                }
                            }
                            ctx.next();
                        })
                        .onFailure(err -> ctx.next());
                })
                .onFailure(err -> ctx.next());
        };
    }
}
