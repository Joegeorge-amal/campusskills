package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.services.UserService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuthHandler {

    private static final Logger log = LoggerFactory.getLogger(AuthHandler.class);
    
    private final UserService userService;

    public AuthHandler(UserService userService) {
        this.userService = userService;
    }

    public void signup(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            String password = body.getString("password");
            String name = body.getString("name");

            userService.signup(email, password, name)
                .onSuccess(data -> ApiResponse.created(ctx, data))
                .onFailure(err -> {
                    if ("EMAIL_EXISTS".equals(err.getMessage())) {
                        ApiResponse.conflict(ctx, "Email already exists");
                    } else if ("DOMAIN_NOT_ALLOWED".equals(err.getMessage())) {
                        ApiResponse.sendError(ctx, 403, "Email domain not allowed for registration");
                    } else {
                        log.error("Signup failed", err);
                        ApiResponse.badRequest(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Invalid signup request payload", e);
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void login(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            String password = body.getString("password");

            userService.login(email, password)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    if ("INVALID_CREDENTIALS".equals(err.getMessage())) {
                        ApiResponse.sendError(ctx, 401, "Invalid email or password");
                    } else {
                        ApiResponse.badRequest(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void refresh(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String refreshToken = body.getString("refreshToken");

            userService.refresh(refreshToken)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    if ("INVALID_REFRESH_TOKEN".equals(err.getMessage()) || 
                        "EXPIRED_REFRESH_TOKEN".equals(err.getMessage()) ||
                        "MISSING_REFRESH_TOKEN".equals(err.getMessage())) {
                        ApiResponse.sendError(ctx, 401, err.getMessage());
                    } else {
                        ApiResponse.badRequest(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void logout(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                // If body is completely empty, fail safely
                ApiResponse.ok(ctx, new JsonObject().put("message", "Logged out locally"));
                return;
            }
            
            String refreshToken = body.getString("refreshToken");

            userService.logout(refreshToken)
                .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Successfully logged out")))
                .onFailure(err -> ApiResponse.internalError(ctx, "Failed to logout"));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void forgotPassword(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            userService.forgotPassword(email)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void verifyResetOtp(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            String otp = body.getString("otp");
            userService.verifyResetOtp(email, otp)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void resetPassword(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String token = body.getString("token");
            String newPassword = body.getString("newPassword");
            userService.resetPassword(token, newPassword)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }
}
